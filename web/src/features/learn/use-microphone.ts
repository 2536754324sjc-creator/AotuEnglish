'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 麦克风权限与录音状态。
 *
 * 关键约束（来自规划文档 §7.6）：
 * - 未授权时给图示引导，不弹长文
 * - 平台不支持或用户拒绝都要有明确落点
 * - 离开页面必须停止录音并释放麦克风
 */
export type MicState = 'idle' | 'requesting' | 'denied' | 'unsupported' | 'ready' | 'recording';

export function useMicrophone() {
  const [state, setState] = useState<MicState>('idle');
  const [level, setLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const stopAll = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    setLevel(0);
  }, []);

  /** 请求权限。失败时区分「不支持」「被拒绝」「其他错误」 */
  const request = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setState('unsupported');
      setErrorMsg('这个浏览器不支持录音');
      return false;
    }
    setState('requesting');
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      setState('ready');
      return true;
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setState('denied');
        setErrorMsg('麦克风权限被拒绝了');
      } else if (name === 'NotFoundError') {
        setState('unsupported');
        setErrorMsg('没有找到麦克风');
      } else {
        setState('unsupported');
        setErrorMsg('麦克风打不开');
      }
      return false;
    }
  }, []);

  /** 开始录音并实时计算音量（0-1），用于画声波 */
  const start = useCallback(async () => {
    if (!streamRef.current) {
      const ok = await request();
      if (!ok) return false;
    }
    const stream = streamRef.current;
    if (!stream) return false;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        // 放大到 0-1，视觉上更明显
        setLevel(Math.min(1, rms * 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      if (typeof MediaRecorder !== 'undefined') {
        recorderRef.current = new MediaRecorder(stream);
        recorderRef.current.start();
      }

      setState('recording');
      return true;
    } catch {
      setState('unsupported');
      setErrorMsg('录音初始化失败');
      return false;
    }
  }, [request]);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    setLevel(0);
    if (streamRef.current) setState('ready');
  }, []);

  // 卸载时务必释放麦克风，否则浏览器会一直显示录音中
  useEffect(() => () => stopAll(), [stopAll]);

  return { state, level, errorMsg, request, start, stop, stopAll };
}
