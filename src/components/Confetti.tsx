'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  '#0052FF', '#3B82FF', '#60A5FA',
  '#00FF88', '#FFD700', '#FF6B6B',
  '#FFFFFF', '#A78BFA',
];

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const particles: Particle[] = Array.from({ length: 150 }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * 140,
      vx: (Math.random() - 0.5) * 5,
      vy: 1.5 + Math.random() * 4,
      w: 7 + Math.random() * 9,
      h: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.18,
      opacity: 1,
    }));

    const startTime = Date.now();
    let frame: number;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const elapsed = Date.now() - startTime;
      let anyVisible = false;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.07; // gravity
        p.vx *= 0.99; // air friction
        p.rotation += p.rotationSpeed;

        // Start fading after 2s
        if (elapsed > 2000) {
          p.opacity = Math.max(0, p.opacity - 0.012);
        }

        if (p.opacity <= 0) continue;
        anyVisible = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (anyVisible || elapsed < 2000) {
        frame = requestAnimationFrame(draw);
      }
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[200]"
      aria-hidden="true"
    />
  );
}
