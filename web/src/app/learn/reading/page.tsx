'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IconSprite } from '@/components/icon-sprite';
import { CardImage } from '@/components/card-image';
import { PageError, PageLoading } from '@/components/page-states';
import { api } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { speak as speakText, stopSpeaking } from '@/lib/speak';
import { saveReadingPage } from '@/lib/progress-store';
import { splitSentence } from '@/lib/reading';
import type { ReadingBook } from '@/lib/mock-readings';
import styles from './reading.module.css';

/** 书架配色：只用 class，不写十六进制（见 design/tokens.ts） */
const TONE: Record<ReadingBook['tone'], string> = {
  sky: styles.toneSky,
  mint: styles.toneMint,
  peach: styles.tonePeach,
  lilac: styles.toneLilac,
  sand: styles.toneSand,
};

export default function ReadingPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, error, loading, reload } = useApi(() => api.getReadings(), []);

  const books = data?.items ?? [];
  const book = books.find((b) => b.id === openId) ?? null;

  return (
    <div className={styles.page}>
      <IconSprite />
      {loading ? (
        <PageLoading label="正在打开书架…" />
      ) : error ? (
        <PageError error={error} onRetry={reload} />
      ) : book ? (
        // key 必须带 book.id：否则换书时 Reader 复用实例，页码会停在上本书记的位置
        <Reader
          key={book.id}
          book={book}
          onClose={() => {
            setOpenId(null);
            // 重新拉一次书架，让进度条体现刚读到的页数
            reload();
          }}
        />
      ) : (
        <Shelf books={books} onOpen={setOpenId} />
      )}
    </div>
  );
}

/* ---------------- 书架 ---------------- */

function Shelf({ books, onOpen }: { books: ReadingBook[]; onOpen: (id: string) => void }) {
  const unlocked = books.filter((b) => b.unlocked);

  return (
    <>
      <header className={styles.head}>
        <Link href="/learn" className={styles.back} aria-label="回到学习地图">
          <svg aria-hidden="true">
            <use href="#i-close" />
          </svg>
        </Link>
        <h1 className={styles.title}>分级读物</h1>
        <span className={styles.counter}>
          {unlocked.length}/{books.length}
        </span>
      </header>

      <p className={styles.lead}>点开一本书，跟着句子一起读。</p>

      <ul className={styles.shelf}>
        {books.map((b) => {
          const pct = Math.round((b.readPages / b.pages.length) * 100);
          const isNew = b.unlocked && b.readPages === 0;
          const finished = b.unlocked && b.readPages >= b.pages.length;
          return (
            <li key={b.id} className={styles.shelfItem}>
              <button
                type="button"
                className={[styles.cover, TONE[b.tone], b.unlocked ? '' : styles.locked]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => b.unlocked && onOpen(b.id)}
                disabled={!b.unlocked}
                aria-label={
                  b.unlocked
                    ? `${b.titleZh}，${b.pages.length} 页，${finished ? '已读完' : `已读 ${b.readPages} 页`}，点击打开`
                    : `${b.titleZh}，尚未解锁`
                }
              >
                <span className={styles.stage}>第 {b.stage} 级</span>
                <span className={styles.coverArt} aria-hidden="true">
                  <CardImage slug={b.cover ?? b.pages[0].img} alt="" />
                </span>

                {b.unlocked ? (
                  isNew ? (
                    <span className={`${styles.badge} ${styles.badgeNew}`}>新</span>
                  ) : finished ? (
                    <span className={`${styles.badge} ${styles.badgeDone}`} aria-hidden="true">
                      <svg>
                        <use href="#i-check" />
                      </svg>
                    </span>
                  ) : null
                ) : (
                  <span className={`${styles.badge} ${styles.badgeLock}`} aria-hidden="true">
                    <svg>
                      <use href="#i-lock" />
                    </svg>
                  </span>
                )}

                {b.unlocked && !finished && b.readPages > 0 && (
                  <span className={styles.progress} aria-hidden="true">
                    <span className={styles.progressBar} style={{ width: `${pct}%` }} />
                  </span>
                )}
              </button>

              <div className={styles.meta}>
                <strong className={b.unlocked ? '' : styles.metaDim}>{b.titleZh}</strong>
                <span className={b.unlocked ? '' : styles.metaDim}>{b.titleEn}</span>
                <span className={styles.pages}>{b.pages.length} 页</span>
              </div>
            </li>
          );
        })}
      </ul>

      <p className={styles.hint}>读完的书会亮起对勾，没解锁的书要先把前面的单元学完。</p>
    </>
  );
}

/* ---------------- 阅读器 ---------------- */

function Reader({ book, onClose }: { book: ReadingBook; onClose: () => void }) {
  // 从上次读到的位置接着读；读完了就从头再读
  const startAt = book.readPages < book.pages.length ? book.readPages : 0;
  const [index, setIndex] = useState(startAt);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flip, setFlip] = useState<'next' | 'prev' | null>(null);
  const flipTimer = useRef<number | null>(null);

  const page = book.pages[index];
  const isFirst = index === 0;
  const isLast = index === book.pages.length - 1;

  // 每翻到一页就记下进度（只前进不后退），关闭阅读器后书架会刷新出新的进度条。
  // 之前 readPages 是写死的静态值，读完也不回写 —— 见 HANDOFF §三 第 9 项。
  useEffect(() => {
    saveReadingPage(book.id, index + 1);
  }, [book.id, index]);

  // 卸载时停掉声音并清掉动画定时器，避免在已卸载组件上 setState
  useEffect(() => {
    return () => {
      if (flipTimer.current !== null) window.clearTimeout(flipTimer.current);
      stopSpeaking();
    };
  }, []);

  const playSentence = useCallback((text: string) => {
    setLoading(true);
    speakText({
      text,
      rate: 0.85,
      onStateChange: (state) => {
        // loading -> playing -> idle 三态
        if (state === 'playing') {
          setLoading(false);
          setPlaying(true);
        } else if (state === 'idle') {
          setLoading(false);
          setPlaying(false);
        }
      },
    });
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
    setPlaying(false);
    setLoading(false);
  }, []);

  const go = useCallback(
    (dir: 'next' | 'prev') => {
      stop();
      setFlip(dir);
      if (flipTimer.current !== null) window.clearTimeout(flipTimer.current);
      flipTimer.current = window.setTimeout(() => {
        setFlip(null);
        flipTimer.current = null;
      }, 320);
      setIndex((i) => (dir === 'next' ? Math.min(i + 1, book.pages.length - 1) : Math.max(i - 1, 0)));
    },
    [book.pages.length, stop],
  );

  // 键盘：左右翻页，空格朗读
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLast) go('next');
      else if (e.key === 'ArrowLeft' && !isFirst) go('prev');
      else if (e.key === 'Escape') onClose();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        playSentence(page.sentence.en);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, isFirst, isLast, onClose, page.sentence.en, playSentence]);

  const parts = splitSentence(page.sentence);

  return (
    <div className={styles.reader}>
      <header className={styles.readerHead}>
        <button type="button" className={styles.back} onClick={onClose} aria-label="回到书架">
          <svg aria-hidden="true">
            <use href="#i-close" />
          </svg>
        </button>
        <div className={styles.readerTitle}>
          <strong>{book.titleZh}</strong>
          <span>{book.titleEn}</span>
        </div>
        <span className={styles.pageNum} aria-live="polite">
          {index + 1}/{book.pages.length}
        </span>
      </header>

      <main
        className={[styles.spread, flip === 'next' ? styles.flipNext : '', flip === 'prev' ? styles.flipPrev : '']
          .filter(Boolean)
          .join(' ')}
        aria-label={`第 ${index + 1} 页，共 ${book.pages.length} 页`}
      >
        <figure className={styles.art}>
          {/* 当前页图片用 priority：翻页时不该看到空白等图 */}
          <CardImage key={page.img} slug={page.img} alt={page.imgAlt} priority />
        </figure>

        <div className={styles.text}>
          <p className={styles.en}>
            {parts.map((part, i) =>
              part.hit ? (
                <button
                  key={`${part.text}-${i}`}
                  type="button"
                  className={styles.wordHit}
                  onClick={() => playSentence(part.text.replace(/[^a-zA-Z']/g, ''))}
                  aria-label={`朗读 ${part.text}`}
                >
                  {part.text}
                </button>
              ) : (
                <span key={`t-${i}`}>{part.text}</span>
              ),
            )}
          </p>
          <p className={styles.zh}>{page.sentence.zh}</p>

          <button
            type="button"
            className={[styles.playBtn, playing ? styles.playOn : ''].filter(Boolean).join(' ')}
            onClick={() => (playing || loading ? stop() : playSentence(page.sentence.en))}
          >
            <svg aria-hidden="true">
              <use href={playing ? '#i-mute' : '#i-sound'} />
            </svg>
            {loading ? '准备中…' : playing ? '停止' : '读给我听'}
          </button>
        </div>
      </main>

      <nav className={styles.pager} aria-label="翻页">
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => go('prev')}
          disabled={isFirst}
          aria-label="上一页"
        >
          <svg aria-hidden="true">
            <use href="#i-play" />
          </svg>
        </button>

        <div className={styles.dots} aria-hidden="true">
          {book.pages.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === index ? styles.dotOn : ''}`} />
          ))}
        </div>

        {isLast ? (
          <button type="button" className={`${styles.pageBtn} ${styles.doneBtn}`} onClick={onClose}>
            读完了
          </button>
        ) : (
          <button type="button" className={styles.pageBtn} onClick={() => go('next')} aria-label="下一页">
            <svg aria-hidden="true">
              <use href="#i-play" />
            </svg>
          </button>
        )}
      </nav>
    </div>
  );
}
