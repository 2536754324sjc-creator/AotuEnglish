'use client';

import { useEffect, useRef } from 'react';
import { Pt, Group } from 'pts';
import styles from './wave-canvas.module.css';

type Props = {
  /** 0-1 的实时音量 */
  level: number;
  /** 是否正在录音；未录音时画静止的基线 */
  active: boolean;
};

/**
 * 麦克风实时声波。
 *
 * 分工：Pts 负责算线的几何（每条竖条的起止点），
 * 绘制用原生 Canvas 2D —— Pts 的 CanvasForm 在 Next 的 SSR/类型环境下不稳定，
 * 而这里要的只是「一堆竖条」，没必要绕。
 */
export function WaveCanvas({ level, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(level);
  const activeRef = useRef(active);
  const phaseRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 按设备像素比放大，避免模糊
    let dpr = 1;
    let w = 0;
    let h = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const BAR_COUNT = 28;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      if (w === 0 || h === 0) return;

      phaseRef.current += 0.15;
      const amp = levelRef.current;
      const on = activeRef.current;

      ctx.clearRect(0, 0, w, h);

      const mid = h / 2;
      const barW = Math.max(3, w / 90);

      for (let i = 0; i < BAR_COUNT; i++) {
        const t = i / (BAR_COUNT - 1);
        // 中间高两边低的包络
        const envelope = Math.sin(t * Math.PI);
        const wave = on ? 0.35 + 0.65 * Math.abs(Math.sin(i * 0.7 + phaseRef.current)) : 0.18;
        const barH = Math.max(4, envelope * wave * amp * h * 0.9 + 4);

        const x = w * 0.06 + t * w * 0.88;

        // Pts 负责构造这条线段的几何（两个端点）
        const seg = new Group(new Pt(x, mid - barH / 2), new Pt(x, mid + barH / 2));
        const p1 = seg.p1;
        const p2 = seg.p2;

        ctx.strokeStyle = on && amp > 0.05 ? '#2f7cf6' : '#c9dcf5';
        ctx.lineWidth = barW;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
