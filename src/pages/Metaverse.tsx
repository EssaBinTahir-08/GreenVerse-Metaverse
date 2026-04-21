import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WorldCanvas } from '../components/metaverse/WorldCanvas';
import { avatarPositionRef } from '../components/metaverse/AvatarController';

// ── Mini-map component ─────────────────────────────────────────
function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const WORLD_SIZE = 160;
  const MAP_SIZE = 120;

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);
      // Background
      ctx.fillStyle = 'rgba(6,13,26,0.85)';
      ctx.beginPath();
      ctx.arc(MAP_SIZE / 2, MAP_SIZE / 2, MAP_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      // Border
      ctx.strokeStyle = '#00ff8844';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Avatar dot
      const pos = avatarPositionRef.current;
      const mapX = (pos.x / WORLD_SIZE + 0.5) * MAP_SIZE;
      const mapZ = (pos.z / WORLD_SIZE + 0.5) * MAP_SIZE;

      ctx.beginPath();
      ctx.arc(mapX, mapZ, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cardinal labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('N', MAP_SIZE / 2, 10);
      ctx.fillText('S', MAP_SIZE / 2, MAP_SIZE - 4);
      ctx.fillText('E', MAP_SIZE - 6, MAP_SIZE / 2 + 4);
      ctx.fillText('W', 7, MAP_SIZE / 2 + 4);

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={MAP_SIZE}
      height={MAP_SIZE}
      style={{ borderRadius: '50%', display: 'block' }}
    />
  );
}

// ── Parcel detail modal ────────────────────────────────────────
interface ParcelModalProps {
  parcelId: number | null;
  onClose: () => void;
}
function ParcelModal({ parcelId, onClose }: ParcelModalProps) {
  if (parcelId === null) return null;
  const owned = [0, 3, 5, 8, 11, 14, 19].includes(parcelId);
  const types = ['Oak', 'Pine', 'Willow', 'Bioluminescent'];
  const treeType = types[parcelId % 4];
  const prices = [0.12, 0.18, 0.09, 0.25, 0.14];
  const price = prices[parcelId % prices.length];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0d2416 100%)',
        border: '1px solid #00ff8844',
        borderRadius: 20, padding: 32, maxWidth: 380, width: '90%',
        boxShadow: '0 0 60px #00ff8822',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: '#00ff88', fontSize: 20, fontWeight: 700, margin: 0 }}>Parcel #{parcelId}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14 }}>
          <div>🌳 <b style={{ color: '#e2e8f0' }}>Tree Type:</b> {treeType}</div>
          <div>📍 <b style={{ color: '#e2e8f0' }}>Location:</b> Grid {Math.floor(parcelId / 5)}-{parcelId % 5}</div>
          <div>🏷️ <b style={{ color: '#e2e8f0' }}>Status:</b> {owned ? '🔒 Owned' : '✅ Available'}</div>
          {!owned && <div>💎 <b style={{ color: '#e2e8f0' }}>Price:</b> <span style={{ color: '#a78bfa' }}>{price} ETH</span></div>}
          <div>🌿 <b style={{ color: '#e2e8f0' }}>Biome:</b> Tropical Forest</div>
          <div>📡 <b style={{ color: '#e2e8f0' }}>Sensor:</b> {owned ? '🟢 Active' : '⚫ Inactive'}</div>
        </div>

        {!owned && (
          <button style={{
            marginTop: 20, width: '100%', padding: '12px 0',
            background: 'linear-gradient(90deg, #059669, #00ff88)',
            border: 'none', borderRadius: 12, color: '#000',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}>
            🌱 Mint This Parcel — {price} ETH
          </button>
        )}
        {owned && (
          <button style={{
            marginTop: 20, width: '100%', padding: '12px 0',
            background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
            border: 'none', borderRadius: 12, color: 'white',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}>
            📡 View Plant Sensor Data
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Metaverse Page ────────────────────────────────────────
export default function Metaverse() {
  const [selectedParcel, setSelectedParcel] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowControls(false), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060d1a', userSelect: 'none' }}>
      {/* 3D World */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <WorldCanvas onParcelClick={setSelectedParcel} />
      </div>

      {/* ── HUD: Top bar ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'linear-gradient(to bottom, rgba(6,13,26,0.9), transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'linear-gradient(135deg, #059669, #00ff88)',
            borderRadius: 10, padding: '6px 14px',
            fontWeight: 800, fontSize: 16, color: '#000', letterSpacing: 1,
          }}>🌍 GREENVERSE</div>
          <span style={{ color: '#00ff88', fontSize: 12, fontFamily: 'monospace' }}>METAVERSE v1.0</span>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #00ff8833', borderRadius: 10, padding: '6px 14px', color: '#00ff88', fontSize: 13, fontWeight: 600 }}>
            🪙 488 ECO
          </div>
          <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #a78bfa33', borderRadius: 10, padding: '6px 14px', color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>
            🌳 3 NFTs
          </div>
          <a href="/marketplace-3d" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #60a5fa33', borderRadius: 10, padding: '6px 14px', color: '#60a5fa', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            🛒 Market
          </a>
          <a href="/plant-sensor" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #4ade8033', borderRadius: 10, padding: '6px 14px', color: '#4ade80', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            📡 Sensors
          </a>
        </div>
      </div>

      {/* ── HUD: Minimap (bottom-right) ── */}
      <div style={{
        position: 'absolute', bottom: 24, right: 24, zIndex: 20,
      }}>
        <Minimap />
        <div style={{ textAlign: 'center', marginTop: 4, color: '#64748b', fontSize: 10, fontFamily: 'monospace' }}>MINIMAP</div>
      </div>

      {/* ── HUD: Controls hint (auto-hides) ── */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, textAlign: 'center',
        transition: 'opacity 1s ease',
        opacity: showControls ? 1 : 0,
        pointerEvents: 'none',
      }}>
        <div style={{
          background: 'rgba(6,13,26,0.85)',
          border: '1px solid #00ff8833',
          borderRadius: 14, padding: '10px 20px', backdropFilter: 'blur(10px)',
        }}>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>CONTROLS</div>
          <div style={{ display: 'flex', gap: 16, color: '#cbd5e1', fontSize: 11 }}>
            <span>🕹️ <b>W A S D</b> — Move</span>
            <span>🖱️ <b>Drag</b> — Camera</span>
            <span>⬆️ <b>Space</b> — Jump</span>
            <span>🏃 <b>Shift</b> — Sprint</span>
            <span>🖱️ <b>Click plot</b> — Inspect</span>
          </div>
        </div>
      </div>

      {/* ── HUD: Position display ── */}
      <div style={{
        position: 'absolute', bottom: 24, left: 24, zIndex: 20,
        background: 'rgba(6,13,26,0.8)', border: '1px solid #1e293b',
        borderRadius: 10, padding: '8px 14px', fontFamily: 'monospace',
        color: '#64748b', fontSize: 11,
      }}>
        <div style={{ color: '#00ff88', fontWeight: 700, marginBottom: 2 }}>📍 POSITION</div>
        <PositionDisplay />
      </div>

      {/* Parcel Modal */}
      <ParcelModal parcelId={selectedParcel} onClose={() => setSelectedParcel(null)} />
    </div>
  );
}

function PositionDisplay() {
  const [pos, setPos] = useState({ x: 0, y: 0, z: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      const p = avatarPositionRef.current;
      setPos({ x: Math.round(p.x), y: Math.round(p.y), z: Math.round(p.z) });
    }, 200);
    return () => clearInterval(id);
  }, []);
  return <div>X: {pos.x} Y: {pos.y} Z: {pos.z}</div>;
}
