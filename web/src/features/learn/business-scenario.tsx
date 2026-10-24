'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Option } from '@/lib/types';
import { speak as speakText, stopSpeaking, type SpeakState } from '@/lib/speak';
import styles from './business-scenario.module.css';

/**
 * 商务场景题（business_scenario）。
 *
 * 面向 17+ / 成人档。与 kids 档的差异：
 * - 信息密度更高，一次显示完整对话上下文
 * - 选项是句子而不是单词/图片
 * - 语气克制，不用「哇」「太棒了」
 *
 * 数据约定：
 * - `audioText`：整段场景对话文本（朗读用）
 * - `options[].text`：候选回复句
 * - `options[].correct`：最佳回复
 *
 * 视觉上刻意与其他题型区分：用「对话气泡」而不是卡片网格，
 * 让成人用户一眼知道这是职场语境，而不是儿童练习。
 */

type Props = {
  options: Option[];
  audioText: string;
  selected: string | null;
  disabled: boolean;
  revealed: boolean;
  onSelect: (optionId: string) => void;
};

/** 把 audioText 拆成对话行：约定用 "|" 或换行分隔说话人 */
function parseDialogue(text: string): { speaker: string; line: string }[] {
  const raw = text.split(/\||\n/).map((s) => s.trim()).filter(Boolean);
  return raw.map((chunk, i) => {
    // 形如 "A: Hello" 时拆出说话人
    const m = chunk.match(/^([A-Za-z\u4e00-\u9fff]{1,12})\s*[:：]\s*(.+)$/);
    if (m) return { speaker: m[1], line: m[2] };
    // 没有说话人：奇数行当对方，偶数行当自己（最简规则）
    return { speaker: i % 2 === 0 ? '对方' : '你', line: chunk };
  });
}

export function BusinessScenario({
  options,
  audioText,
  selected,
  disabled,
  revealed,
  onSelect,
}: Props) {
  const [speakState, setSpeakState] = useState<SpeakState>('idle');
  const speaking = speakState === 'playing';

  const dialogue = parseDialogue(audioText);

  useEffect(() => () => stopSpeaking(), []);

  const play = useCallback(() => {
    if (!audioText) return;
    speakText({ text: audioText.replace(/\|/g, '. '), rate: 0.85, onStateChange: setSpeakState });
  }, [audioText]);

  return (
    <div className={styles.wrap}>
      {/* 场景上下文：对话气泡 */}
      <section className={styles.scene} aria-label="对话场景">
        {dialogue.map((d, i) => (
          <div key={i} className={styles.bubbleRow}>
            <span className={styles.speaker}>{d.speaker}</span>
            <p className={styles.bubble}>{d.line}</p>
          </div>
        ))}

        <button
          type="button"
          className={`${styles.replay} ${speaking ? styles.speaking : ''}`}
          onClick={play}
          aria-label="播放这段对话"
        >
          <svg aria-hidden="true">
            <use href={speaking ? '#i-pause' : '#i-sound'} />
          </svg>
          {speaking ? '播放中' : '听一遍'}
        </button>
      </section>

      <p className={styles.prompt}>你会怎么回？</p>

      {/* 选项：整句回复 */}
      <div className={styles.choices} role="group" aria-label="候选回复">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = revealed && opt.correct;
          return (
            <button
              key={opt.id}
              type="button"
              className={[
                styles.option,
                isSelected ? styles.selected : '',
                isCorrect ? styles.correct : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(opt.id)}
              disabled={disabled}
              aria-pressed={isSelected}
            >
              <span className={styles.optionText}>{opt.text}</span>
              {isCorrect && (
                <span className={styles.badge} aria-hidden="true">
                  <svg>
                    <use href="#i-check" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
