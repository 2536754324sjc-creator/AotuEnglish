'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { IconSprite } from '@/components/icon-sprite';
import { WaveCanvas } from '@/features/learn/wave-canvas';
import { useMicrophone } from '@/features/learn/use-microphone';
import { speak as speakText, stopSpeaking, type SpeakState } from '@/lib/speak';
import styles from './speak.module.css';

/** 跟读练习的句子池 */
const prompts = [
  { en: 'Hello!', zh: '你好', hint: '注意 th 不发音，口型放松' },
  { en: 'I like apples.', zh: '我喜欢苹果', hint: 'like 的 k 要轻' },
  { en: 'How are you?', zh: '你好吗', hint: '尾音上扬' },
  { en: 'Thank you.', zh: '谢谢', hint: 'th 用舌尖轻触上齿' },
  { en: 'Good morning.', zh: '早上好', hint: 'morning 有儿化' },
];

type Stage = 'idle' | 'recording' | 'scored';

export default function SpeakPage() {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('idle');
  const [demoSpeaking, setDemoSpeaking] = useState(false);
  /** 录音期间的最高音量，用来判断「到底有没有录到声音」 */
  const [peakLevel, setPeakLevel] = useState(0);
  const mic = useMicrophone();

  const current = prompts[index];

  // 录音中持续记录峰值
  useEffect(() => {
    if (stage === 'recording') {
      setPeakLevel((p) => Math.max(p, mic.level));
    }
  }, [mic.level, stage]);

  /** 播放示范音 */
  const playDemo = useCallback(() => {
    speakText({
      text: current.en,
      rate: 0.8,
      onStateChange: (s: SpeakState) => setDemoSpeaking(s === 'playing'),
    });
  }, [current.en]);

  // 进页面先示范一遍
  useEffect(() => {
    const t = window.setTimeout(playDemo, 400);
    return () => {
      window.clearTimeout(t);
      stopSpeaking();
    };
  }, [playDemo]);

  const startRecording = useCallback(async () => {
    setPeakLevel(0);
    const ok = await mic.start();
    if (ok) setStage('recording');
  }, [mic]);

  const stopRecording = useCallback(() => {
    mic.stop();
    setStage('scored');
  }, [mic]);

  const nextPrompt = () => {
    setIndex((i) => (i + 1) % prompts.length);
    setStage('idle');
    setPeakLevel(0);
  };

  const isRecording = stage === 'recording';

  return (
    <div className={styles.page}>
      <IconSprite />

      <header className={styles.head}>
        <Link href="/learn" className={styles.back} aria-label="回到学习地图">
          <svg aria-hidden="true">
            <use href="#i-close" />
          </svg>
        </Link>
        <h1 className={styles.title}>跟读口语</h1>
        <span className={styles.progress}>
          {index + 1}/{prompts.length}
        </span>
      </header>

      <main className={styles.main}>
        {/* 题面：示范句 */}
        <div className={styles.card}>
          <p className={styles.zh}>{current.zh}</p>
          <p className={styles.en}>{current.en}</p>
          <button
            type="button"
            className={`${styles.demoBtn} ${demoSpeaking ? styles.demoOn : ''}`}
            onClick={playDemo}
          >
            <svg aria-hidden="true">
              <use href="#i-sound" />
            </svg>
            听示范
          </button>
          <p className={styles.hint}>{current.hint}</p>
        </div>

        {/* 未授权时的图示引导 */}
        {(mic.state === 'denied' || mic.state === 'unsupported') && (
          <div className={styles.permBox} role="alert">
            <div className={styles.permArt} aria-hidden="true">
              <svg>
                <use href="#i-mic" />
              </svg>
              <span className={styles.permCross} />
            </div>
            <div>
              <h2 className={styles.permTitle}>{mic.errorMsg}</h2>
              <p className={styles.permDesc}>
                {mic.state === 'denied'
                  ? '在浏览器地址栏左侧点锁图标，把「麦克风」改成允许，然后刷新这一页。'
                  : '换一个浏览器，或者检查电脑上有没有插麦克风。'}
              </p>
              <button type="button" className={styles.permRetry} onClick={mic.request}>
                我再试一次
              </button>
            </div>
          </div>
        )}

        {/* 声波 */}
        <WaveCanvas level={isRecording ? mic.level : 0} active={isRecording} />

        {/* 主操作 */}
        {stage !== 'scored' ? (
          <div className={styles.recordArea}>
            <button
              type="button"
              className={`${styles.micBtn} ${isRecording ? styles.micOn : ''}`}
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              onPointerLeave={() => isRecording && stopRecording()}
              onKeyDown={(e) => {
                if (e.key === ' ' && !isRecording) {
                  e.preventDefault();
                  startRecording();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === ' ' && isRecording) {
                  e.preventDefault();
                  stopRecording();
                }
              }}
              aria-label={isRecording ? '松开结束录音' : '按住说话'}
            >
              <svg aria-hidden="true">
                <use href="#i-mic" />
              </svg>
            </button>
            <p className={styles.recordHint}>{isRecording ? '松开结束' : '按住说话'}</p>
          </div>
        ) : (
          <div className={styles.result}>
            <div className={styles.resultIcon} aria-hidden="true">
              <svg>
                <use href="#i-check" />
              </svg>
            </div>
            <p className={styles.resultTitle}>录好了</p>
            <p className={styles.resultNote}>
              {peakLevel > 0.08
                ? '听到了你的声音。再听一遍示范，对比一下语调。'
                : '这次好像没录到声音，检查一下麦克风再试。'}
            </p>
            <div className={styles.resultActions}>
              <button type="button" className={styles.primary} onClick={nextPrompt}>
                下一句
              </button>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => {
                  setStage('idle');
                  setPeakLevel(0);
                }}
              >
                再说一次
              </button>
            </div>
          </div>
        )}

        <p className={styles.disclaimer}>
          当前只做录音与回放，不给分数 —— 打分需要接入真实的语音测评服务。
          录音只在本机处理，不会上传。
        </p>
      </main>
    </div>
  );
}
