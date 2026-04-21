import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// ── Tunnel / Warp portal canvas ────────────────────────────────
function WarpTunnel({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const speedRef = useRef(0.3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let t = 0;

    // When active=true, ramp up to warp speed for final entry
    const targetSpeed = active ? 14 : 0.5;

    const draw = () => {
      speedRef.current += (targetSpeed - speedRef.current) * 0.06;
      t += speedRef.current * 0.003;

      ctx.fillStyle = `rgba(6,13,26,${active ? 0.15 : 0.25})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const RINGS = 24;
      const LINES = 12;

      // Warp tunnel rings
      for (let r = 0; r < RINGS; r++) {
        const depth = ((r / RINGS + t) % 1);
        const radius = depth * Math.max(canvas.width, canvas.height) * 0.85;
        const alpha = (1 - depth) * 0.6 * (active ? 1.4 : 1);
        const hue = 145 + Math.sin(t * 2 + r * 0.5) * 20;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 100%, 55%, ${Math.min(alpha, 1)})`;
        ctx.lineWidth = active ? 1.5 : 0.8;
        ctx.stroke();
      }

      // Radial speed lines
      for (let l = 0; l < LINES; l++) {
        const angle = (l / LINES) * Math.PI * 2 + t * 0.4;
        const innerR = 30 + speedRef.current * 4;
        const outerR = 120 + speedRef.current * 18;
        const alpha = 0.15 + speedRef.current * 0.02;

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.strokeStyle = `rgba(0,255,136,${Math.min(alpha, 0.7)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Central glow orb
      const glowR = 30 + Math.sin(t * 3) * 8 + speedRef.current * 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR * 3);
      grad.addColorStop(0, `rgba(0,255,136,${0.3 + speedRef.current * 0.03})`);
      grad.addColorStop(0.4, `rgba(0,200,100,0.15)`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, glowR * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [active]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

// ── Floating particles ─────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 4,
    dur: 4 + Math.random() * 5,
    size: 1 + Math.random() * 2,
    opacity: 0.2 + Math.random() * 0.5,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          bottom: '-10px',
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: '#00ff88',
          opacity: p.opacity,
          animation: `floatUp ${p.dur}s ${p.delay}s infinite linear`,
          boxShadow: `0 0 ${p.size * 3}px #00ff88`,
        }} />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '+' : '-'}30px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Main MetaVerse Portal Intro ───────────────────────────────
export const StoryIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [stage, setStage] = useState(0);
  const [warping, setWarping] = useState(false);
  const [exiting, setExiting] = useState(false);

  const stages = [
    { label: 'NEURAL UPLINK ESTABLISHED', sub: 'Connecting to GreenVerse network…', icon: '⬡' },
    { label: 'ECOSYSTEM NODES ONLINE',    sub: 'Loading bioluminescent world…',     icon: '🌿' },
    { label: 'GUARDIAN PROTOCOL ACTIVE',  sub: 'Syncing on-chain assets…',           icon: '🛡️' },
    { label: 'ENTERING THE METAVERSE',    sub: 'Prepare for warp drive.',            icon: '🌍' },
  ];

  useEffect(() => {
    const t0 = setTimeout(() => setStage(1), 1800);
    const t1 = setTimeout(() => setStage(2), 3600);
    const t2 = setTimeout(() => setStage(3), 5200);
    const t3 = setTimeout(() => setWarping(true), 6400);       // trigger warp
    const t4 = setTimeout(() => setExiting(true), 7400);       // fade out
    const t5 = setTimeout(() => onComplete(), 8600);           // done

    return () => [t0, t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 1.08 : 1 }}
        transition={{ duration: 1.2, ease: 'easeIn' }}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: '#06090f', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Warp tunnel canvas */}
        <WarpTunnel active={warping} />

        {/* Floating particles */}
        <Particles />

        {/* HUD corners */}
        <div style={{ position: 'absolute', top: 20, left: 24, fontFamily: 'monospace', fontSize: 10, color: 'rgba(0,255,136,0.35)', lineHeight: 1.8 }}>
          <div>⬡ NEURAL_BRIDGE: ACTIVE</div>
          <div>📡 NODES: {stage * 28}/112 synced</div>
          <div>🔐 ENCRYPTION: AES-256</div>
        </div>
        <div style={{ position: 'absolute', top: 20, right: 24, fontFamily: 'monospace', fontSize: 10, color: 'rgba(0,255,136,0.35)', textAlign: 'right', lineHeight: 1.8 }}>
          <div>GreenVerse v3.0</div>
          <div>Polygon Mainnet</div>
          <div style={{ color: 'rgba(0,255,136,0.6)' }}>● LIVE_SYNC</div>
        </div>
        <div style={{ position: 'absolute', bottom: 20, left: 24, fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,255,136,0.2)', maxWidth: 280, lineHeight: 1.5 }}>
          Blockchain environmental proof-of-work initializing.<br />Neural focus required for full immersion.
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', pointerEvents: 'none' }}>

          {/* Animated portal ring */}
          <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer rotating ring */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid rgba(0,255,136,0.2)',
              animation: 'spinCW 8s linear infinite',
            }} />
            {/* Middle ring */}
            <div style={{
              position: 'absolute', inset: 16, borderRadius: '50%',
              border: '1px dashed rgba(0,255,136,0.15)',
              animation: 'spinCCW 12s linear infinite',
            }} />
            {/* Inner ring pulsing */}
            <div style={{
              position: 'absolute', inset: 32, borderRadius: '50%',
              border: '2px solid rgba(0,255,136,0.35)',
              animation: `${warping ? 'pulseRingFast' : 'pulseRing'} 1.5s ease-in-out infinite`,
              boxShadow: warping ? '0 0 40px rgba(0,255,136,0.6), inset 0 0 40px rgba(0,255,136,0.1)' : '0 0 20px rgba(0,255,136,0.3)',
            }} />

            {/* Stage icon */}
            <motion.div
              key={stage}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: warping ? 1.3 : 1 }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: warping ? 52 : 44, lineHeight: 1, position: 'relative', zIndex: 1 }}
            >
              {stages[stage]?.icon}
            </motion.div>
          </div>

          {/* Stage text */}
          <motion.div key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{
              fontFamily: 'monospace', letterSpacing: '0.28em', fontSize: 11,
              color: warping ? '#00ff88' : 'rgba(0,255,136,0.75)',
              fontWeight: 900, marginBottom: 8,
              textShadow: warping ? '0 0 20px #00ff88' : 'none',
              transition: 'color 0.4s, text-shadow 0.4s',
            }}>
              {stages[stage]?.label}
            </div>
            <div style={{ color: 'rgba(148,163,184,0.6)', fontSize: 12, letterSpacing: '0.05em' }}>
              {stages[stage]?.sub}
            </div>
          </motion.div>

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 28 }}>
            {stages.map((_, i) => (
              <div key={i} style={{
                height: 3, width: 40, borderRadius: 4,
                background: stage >= i ? '#00ff88' : 'rgba(0,255,136,0.12)',
                boxShadow: stage >= i ? '0 0 8px rgba(0,255,136,0.6)' : 'none',
                transition: 'all 0.5s ease',
              }} />
            ))}
          </div>

          {/* Skip button */}
          <button
            onClick={onComplete}
            style={{
              marginTop: 36, background: 'transparent', border: 'none',
              color: 'rgba(71,85,105,0.7)', fontSize: 11, cursor: 'pointer',
              fontFamily: 'monospace', letterSpacing: '0.1em', pointerEvents: 'all',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(0,255,136,0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(71,85,105,0.7)')}
          >□ SKIP INTRO</button>
        </div>

        <style>{`
          @keyframes spinCW  { to { transform: rotate(360deg); } }
          @keyframes spinCCW { to { transform: rotate(-360deg); } }
          @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:0.35} 50%{transform:scale(1.05);opacity:0.6} }
          @keyframes pulseRingFast { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.12);opacity:1} }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};
