'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Option } from '@/lib/types';
import { speak as speakText, stopSpeaking, type SpeakState } from '@/lib/speak';
import { useMicrophone } from './use-microphone';
import { WaveCanvas } from './wave-canvas';
import styles from './repeat-word.module.css';

/**
 * 跟读题（repeat_word）。
 *
 * 交互：听示范音 → 按住说 → 松开
 *
 * ⚠️ 关于「打分」的诚实处理：
 * 没有接入语音测评服务（讯飞/Azure），所以**我们不编造分数**。
 * 现在的反馈规则是：
 * - 录音时长 < 0.6 秒 → 提示「太短了，再试一次」（这是真实可测的）
 * - 其余情况 → 显示「录到了」，并让用户自己对比示范音
 *
 * 一旦接入测评服务，只需把 `onRecorded` 里的判定换成真实分数，
 * 界面结构不用动。这一点写在 HANDOFF 的技术债里。
 */

/** 录音最短时长：低于这个值基本是误触 */
const MIN_DURATION_MS = 600;

type Props = {
  options: Option[];
  audioText: string;
  selected: string | null;
  disabled: boolean;
  onSelect: (optionId: string) => void;
};

export function RepeatWord({ options, audioText, selected, disabled, onSelect }: Props) {
  const mic = useMicrophone();
  const [speakState, setSpeakState] = useState<SpeakState>('idle');
  const [recording, setRecording] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  // 'short' = 录得太短；'ok' = 录到了；null = 还没录
  const [result, setResult] = useState<'short' | 'ok' | null>(null);

  const speaking = speakState === 'playing';

  // 离开时停掉声音，避免串音
  useEffect(() => () => stopSpeaking(), []);

  const playExample = useCallback(() => {
    if (!audioText) return;
    speakText({ text: audioText, rate: 0.75, onStateChange: setSpeakState });
  }, [audioText]);

  const startRecording = useCallback(async () => {
    if (disabled || recording) return;
    stopSpeaking();
    setResult(null);

    // 首次点按会触发权限请求
    const ok = await mic.start();
    if (!ok) return;

    setRecording(true);
    setStartedAt(Date.now());
  }, [disabled, recording, mic]);

  const stopRecording = useCallback(() => {
    if (!recording) return;
    const duration = Date.now() - startedAt;
    mic.stop();
    setRecording(false);

    if (duration < MIN_DURATION_MS) {
      setResult('short');
      return;
    }
    setResult('ok');
    // 单选型题目：录完即视为完成这道题
    const only = options[0];
    if (only) onSelect(only.id);
  }, [recording, startedAt, mic, options, onSelect]);

  // 键盘可达性：空格按住说话
  useEffect(() => {
    if (disabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        void startRecording();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        stopRecording();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [disabled, startRecording, stopRecording]);

  // 麦克风不可用：给出明确落点，不写长篇
  if (mic.state === 'unsupported') {
    return (
      <div className={styles.wrap}>
        <div className={styles.fallback}>
          <p className={styles.fallbackTitle}>这个浏览器不能录音</p>
          <p className={styles.fallbackDesc}>换成 Chrome 或 Safari 就能跟读。</p>
          <button
            type="button"
            className={styles.skipBtn}
            onClick={() => options[0] && onSelect(options[0].id)}
            disabled={disabled}
          >
            先跳过这道
          </button>
        </div>
      </div>
    );
  }

  if (mic.state === 'denied') {
    return (
      <div className={styles.wrap}>
        <div className={styles.fallback}>
          <div className={styles.micIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className={styles.fallbackTitle}>需要麦克风才能跟读</p>
          {/* 只给操作路径，不弹长文 */}
          <p className={styles.fallbackDesc}>
            点地址栏左边的锁图标，把「麦克风」改成「允许」，再点下面的按钮。
          </p>
          <button type="button" className={styles.retryBtn} onClick={() => void mic.start()}>
            再试一次
          </button>
          <button
            type="button"
            className={styles.skipBtn}
            onClick={() => options[0] && onSelect(options[0].id)}
            disabled={disabled}
          >
            先跳过这道
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* 示范音 */}
      <button
        type="button"
        className={`${styles.example} ${speaking ? styles.speaking : ''}`}
        onClick={playExample}
        aria-label="再听一次示范"
      >
        <svg aria-hidden="true">
          <use href="#i-sound" />
        </svg>
        <span className={styles.exampleWord}>{audioText}</span>
      </button>

      {/* 波形：录音时显示实时音量 */}
      <div className={`${styles.wave} ${recording ? styles.waveOn : ''}`}>
        {recording ? (
          <WaveCanvas level={mic.level} active />
        ) : (
          <div className={styles.waveIdle} aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} style={{ height: `${12 + ((i * 7) % 16)}px` }} />
            ))}
          </div>
        )}
      </div>

      {/* 按住说话 */}
      <button
        type="button"
        className={`${styles.hold} ${recording ? styles.holdOn : ''} ${selected ? styles.done : ''}`}
        disabled={disabled}
        onMouseDown={() => void startRecording()}
        onMouseUp={stopRecording}
        onMouseLeave={() => recording && stopRecording()}
        onTouchStart={(e) => {
          e.preventDefault();
          void startRecording();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          stopRecording();
        }}
        aria-label={recording ? '松开结束录音' : '按住说话'}
      >
        <svg aria-hidden="true">
          <use href="#i-mic" />
        </svg>
        {recording ? '松开结束' : selected ? '录好了，可以下一个' : '按住说话'}
      </button>

      {/* 反馈 */}
      <p className={styles.hint} aria-live="polite">
        {result === 'short' && '太短了，按住多说一会儿再松开。'}
        {result === 'ok' && '录到了。对比一下示范音，觉得自己读得像就点「检查一下」。'}
        {result === null && mic.state === 'ready' && '按住按钮，跟着读一遍。'}
      </p>
    </div>
  );
}
