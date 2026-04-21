import React, { useEffect, useRef } from "react";

// ── Animated scan-grid canvas (metaverse grid floor) ──────────
function MetaGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;

    const draw = () => {
      t += 0.004;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;
      const CELL = 80;
      const horizon = H * 0.62;  // perspective vanishing point row

      // Perspective converging vertical grid lines
      const cols = Math.ceil(W / CELL) + 2;
      const vp = { x: W / 2, y: horizon };

      ctx.save();
      for (let c = -cols; c <= cols; c++) {
        const x = W / 2 + c * CELL;
        const alpha = Math.max(0, 0.06 - Math.abs(c) * 0.004);
        ctx.beginPath();
        ctx.moveTo(vp.x + (x - vp.x) * 0.01, horizon);
        ctx.lineTo(x, H + 100);
        ctx.strokeStyle = `rgba(0,255,136,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Horizontal scan lines moving away from viewer
      const HLINES = 12;
      for (let h = 0; h < HLINES; h++) {
        const depth = ((h / HLINES) + t * 0.25) % 1;
        const y = horizon + depth * (H - horizon + 100);
        const alpha = depth * 0.07;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.strokeStyle = `rgba(0,255,136,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.restore();

      // Ambient glowing orbs (3 fixed) — very subtle
      const orbs = [
        { x: W * 0.15, y: H * 0.3, r: 220, color: '0,255,136', a: 0.035 },
        { x: W * 0.85, y: H * 0.6, r: 180, color: '167,139,250', a: 0.028 },
        { x: W * 0.5,  y: H * 0.8, r: 140, color: '251,191,36', a: 0.018 },
      ];
      orbs.forEach(({ x, y, r, color, a }) => {
        const pulse = 1 + Math.sin(t * 1.5) * 0.1;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * pulse);
        grad.addColorStop(0, `rgba(${color},${a})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.9 }}
    />
  );
}

// ── Main Global Background ─────────────────────────────────────
export const GlobalBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">

      {/* Deep space base */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 0%, #0a1f10 0%, #060d1a 50%, #030608 100%)',
      }} />

      {/* Background forest video — tinted heavily to feel metaverse */}
      <video
        autoPlay muted loop playsInline
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.18,
          filter: 'saturate(0.4) brightness(0.6) hue-rotate(50deg)',
          transform: 'scale(1.04)',
        }}
        poster="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-forest-river-in-the-sunshine-601-large.mp4" type="video/mp4" />
      </video>

      {/* Metaverse perspective grid + orbs */}
      <MetaGrid />

      {/* Top vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(4,8,14,0.85) 0%, transparent 30%, transparent 70%, rgba(4,8,14,0.9) 100%)',
        zIndex: 2,
      }} />

      {/* Noise texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, opacity: 0.025,
        backgroundImage: 'url(https://grainy-gradients.vercel.app/noise.svg)',
      }} />
    </div>
  );
};
