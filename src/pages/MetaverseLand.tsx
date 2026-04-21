import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Parcel {
  id: number;
  col: number;
  row: number;
  owner: string | null;
  species: string | null;
  biome: string;
  price: number;
}

const BIOME_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  tropical: { fill: '#064e3b', stroke: '#059669', label: '🌴 Tropical' },
  temperate: { fill: '#1e3a5f', stroke: '#3b82f6', label: '🌲 Temperate' },
  savanna: { fill: '#451a03', stroke: '#d97706', label: '🌾 Savanna' },
  alpine: { fill: '#1e1b4b', stroke: '#8b5cf6', label: '🏔️ Alpine' },
};

const BIOMES = ['tropical', 'temperate', 'savanna', 'alpine'];
const OWNED_IDS = [2, 7, 12, 18, 23, 28, 34, 41, 45, 50, 55, 61, 67, 72, 78];

function generateParcels(): Parcel[] {
  const parcels: Parcel[] = [];
  const species = ['Oak', 'Pine', 'Willow', 'Bioluminescent'];
  let id = 0;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const biome = BIOMES[Math.floor((row * 10 + col) / 25)];
      const owned = OWNED_IDS.includes(id);
      parcels.push({
        id, col, row,
        owner: owned ? `0x${id.toString(16).padStart(4, '0')}…` : null,
        species: owned ? species[id % 4] : null,
        biome,
        price: 0.05 + Math.sin(id * 0.3) * 0.04 + Math.cos(id * 0.5) * 0.02,
      });
      id++;
    }
  }
  return parcels;
}

const PARCELS = generateParcels();

// Hex grid coordinates
function hexPoints(cx: number, cy: number, size: number) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

function getHexCenter(col: number, row: number, size: number, padding: number) {
  const w = Math.sqrt(3) * size;
  const h = 2 * size * 0.75;
  const x = padding + col * w + (row % 2 === 1 ? w / 2 : 0) + size;
  const y = padding + row * h + size;
  return { x, y };
}

export default function MetaverseLand() {
  const [selected, setSelected] = useState<Parcel | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'owned' | 'available'>('all');
  const navigate = useNavigate();

  const HEX_SIZE = 28;
  const PADDING = 20;
  const totalW = PADDING * 2 + 10 * Math.sqrt(3) * HEX_SIZE + HEX_SIZE;
  const totalH = PADDING * 2 + 10 * 2 * HEX_SIZE * 0.75 + HEX_SIZE;

  const filtered = PARCELS.filter((p) => {
    if (filter === 'owned') return p.owner !== null;
    if (filter === 'available') return p.owner === null;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #060d1a 0%, #0a1f11 100%)', padding: '24px 20px 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 34, fontWeight: 900, margin: '0 0 8px',
            background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>🗺️ GreenVerse Land Map</h1>
          <p style={{ color: '#64748b', margin: '0 0 16px' }}>
            Own a parcel in the GreenVerse metaverse. Each LAND NFT unlocks a sensor node, tree planting rights, and in-world building rights.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              { label: 'Total Parcels', value: '100', color: '#94a3b8' },
              { label: 'Owned', value: OWNED_IDS.length.toString(), color: '#a78bfa' },
              { label: 'Available', value: (100 - OWNED_IDS.length).toString(), color: '#00ff88' },
              { label: 'Floor Price', value: '0.05 ETH', color: '#fbbf24' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'rgba(15,23,42,0.85)', border: '1px solid #1e293b',
                borderRadius: 14, padding: '12px 20px',
              }}>
                <div style={{ color: '#475569', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{label}</div>
                <div style={{ color, fontSize: 22, fontWeight: 800 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Filter + Biome legend */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {(['all', 'owned', 'available'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: `1px solid ${filter === f ? '#00ff88' : '#334155'}`,
                background: filter === f ? '#00ff8822' : 'transparent',
                color: filter === f ? '#00ff88' : '#64748b', cursor: 'pointer',
              }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
            <div style={{ marginLeft: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(BIOME_COLORS).map(([b, c]) => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94a3b8' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: c.fill, border: `1px solid ${c.stroke}` }} />
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          {/* Hex Map */}
          <div style={{
            background: 'rgba(10,16,30,0.9)', border: '1px solid #1e293b',
            borderRadius: 20, overflow: 'auto', padding: 12,
          }}>
            <svg width={totalW} height={totalH} style={{ display: 'block' }}>
              {PARCELS.map((parcel) => {
                const show = filter === 'all' || (filter === 'owned' && parcel.owner) || (filter === 'available' && !parcel.owner);
                const { x, y } = getHexCenter(parcel.col, parcel.row, HEX_SIZE, PADDING);
                const biome = BIOME_COLORS[parcel.biome];
                const isHov = hovered === parcel.id;
                const isSel = selected?.id === parcel.id;

                return (
                  <g key={parcel.id}
                    onClick={() => setSelected(parcel)}
                    onMouseEnter={() => setHovered(parcel.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <polygon
                      points={hexPoints(x, y, HEX_SIZE - 2)}
                      fill={show ? (parcel.owner ? biome.fill : '#0a1628') : '#060d1a'}
                      stroke={isSel ? '#ffffff' : isHov ? '#00ff88' : parcel.owner ? biome.stroke : '#1e293b'}
                      strokeWidth={isSel ? 2.5 : isHov ? 2 : 1}
                      opacity={show ? 1 : 0.2}
                      style={{ transition: 'all 0.15s ease', filter: isHov || isSel ? `drop-shadow(0 0 6px ${biome.stroke}88)` : 'none' }}
                    />
                    {parcel.owner && show && (
                      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill={biome.stroke} fontSize={9} fontWeight="bold">
                        {parcel.species?.slice(0, 2).toUpperCase()}
                      </text>
                    )}
                    {!parcel.owner && show && isHov && (
                      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="#00ff8888" fontSize={8}>
                        #{parcel.id}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Parcel detail panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selected ? (
              <div style={{
                background: 'rgba(15,23,42,0.9)', border: `1px solid ${BIOME_COLORS[selected.biome].stroke}44`,
                borderRadius: 20, padding: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ color: '#e2e8f0', fontWeight: 800, margin: 0, fontSize: 18 }}>Parcel #{selected.id}</h3>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 18 }}>✕</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: 'Location', value: `[${selected.col}, ${selected.row}]`, color: '#94a3b8' },
                    { label: 'Biome', value: BIOME_COLORS[selected.biome].label, color: BIOME_COLORS[selected.biome].stroke },
                    { label: 'Status', value: selected.owner ? '🔒 Owned' : '✅ Available', color: selected.owner ? '#a78bfa' : '#00ff88' },
                    { label: 'Species', value: selected.species || 'None yet', color: '#4ade80' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: '#0f172a', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ color: '#475569', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>{label}</div>
                      <div style={{ color, fontSize: 13, fontWeight: 700, marginTop: 2 }}>{value}</div>
                    </div>
                  ))}
                </div>

                {selected.owner && (
                  <div style={{ background: '#0f172a', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
                    <div style={{ color: '#475569', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>OWNER</div>
                    <div style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'monospace', marginTop: 2 }}>{selected.owner}</div>
                  </div>
                )}

                {!selected.owner && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ color: '#64748b', fontSize: 13 }}>Price</span>
                      <span style={{ color: '#a78bfa', fontWeight: 800, fontSize: 20 }}>{selected.price.toFixed(3)} ETH</span>
                    </div>
                    <button
                      onClick={() => alert(`Minting Parcel #${selected.id}…`)}
                      style={{
                        width: '100%', padding: '12px 0', borderRadius: 14,
                        background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                        border: 'none', color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                      }}
                    >🪙 Mint LAND NFT</button>
                    <button
                      onClick={() => navigate('/metaverse')}
                      style={{
                        width: '100%', padding: '10px 0', borderRadius: 14, marginTop: 8,
                        background: 'transparent', border: '1px solid #334155',
                        color: '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      }}
                    >🌍 Preview in Metaverse</button>
                  </>
                )}

                {selected.owner && (
                  <button
                    onClick={() => navigate('/plant-sensor')}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 14,
                      background: 'linear-gradient(135deg, #059669, #00ff88)',
                      border: 'none', color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    }}
                  >📡 View Sensor Data</button>
                )}
              </div>
            ) : (
              <div style={{
                background: 'rgba(15,23,42,0.85)', border: '1px solid #1e293b',
                borderRadius: 20, padding: 24, textAlign: 'center', color: '#475569',
              }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🗺️</div>
                <div style={{ fontSize: 14 }}>Click any hexagon to inspect a parcel</div>
              </div>
            )}

            {/* Quick stats */}
            <div style={{
              background: 'rgba(15,23,42,0.85)', border: '1px solid #1e293b',
              borderRadius: 20, padding: 20,
            }}>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>BIOME BREAKDOWN</div>
              {Object.entries(BIOME_COLORS).map(([b, c]) => {
                const count = PARCELS.filter((p) => p.biome === b).length;
                const ownedCount = PARCELS.filter((p) => p.biome === b && p.owner).length;
                return (
                  <div key={b} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: '#94a3b8' }}>{c.label}</span>
                      <span style={{ color: c.stroke }}>{ownedCount}/{count} owned</span>
                    </div>
                    <div style={{ height: 4, background: '#1e293b', borderRadius: 4 }}>
                      <div style={{ height: '100%', borderRadius: 4, background: c.stroke, width: `${(ownedCount / count) * 100}%`, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
