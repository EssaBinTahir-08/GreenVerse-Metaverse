import React from 'react';

interface SensorGaugeProps {
  label: string;
  value: number | null;
  unit: string;
  min: number;
  max: number;
  optimal: [number, number];  // [lo, hi] green zone
  icon: string;
  color: string;
}

function getStatusColor(value: number | null, optimal: [number, number], max: number): string {
  if (value === null) return '#475569';
  if (value >= optimal[0] && value <= optimal[1]) return '#22c55e';
  const distLo = Math.abs(value - optimal[0]);
  const distHi = Math.abs(value - optimal[1]);
  const dist = Math.min(distLo, distHi);
  const range = max * 0.2;
  if (dist < range * 0.5) return '#facc15';
  return '#ef4444';
}

export function SensorGauge({ label, value, unit, min, max, optimal, icon, color }: SensorGaugeProps) {
  const pct = value !== null ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;
  const statusColor = getStatusColor(value, optimal, max);

  // SVG arc gauge
  const R = 42;
  const cx = 60, cy = 60;
  const startAngle = -210;
  const sweepAngle = 240;
  const angle = startAngle + pct * sweepAngle;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcX = (deg: number) => cx + R * Math.cos(toRad(deg));
  const arcY = (deg: number) => cy + R * Math.sin(toRad(deg));

  const largeArc = pct * sweepAngle > 180 ? 1 : 0;

  const bgPath = `M ${arcX(startAngle)} ${arcY(startAngle)} A ${R} ${R} 0 1 1 ${arcX(startAngle + sweepAngle)} ${arcY(startAngle + sweepAngle)}`;
  const valPath = pct > 0
    ? `M ${arcX(startAngle)} ${arcY(startAngle)} A ${R} ${R} 0 ${largeArc} 1 ${arcX(angle)} ${arcY(angle)}`
    : '';

  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.85)',
        border: `1px solid ${statusColor}44`,
        borderRadius: 16,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 0 20px ${statusColor}22`,
        transition: 'all 0.3s ease',
        minWidth: 140,
      }}
    >
      <span style={{ fontSize: 24 }}>{icon}</span>

      {/* SVG Gauge */}
      <svg width={120} height={80} viewBox="0 0 120 80">
        {/* Background arc */}
        <path d={bgPath} fill="none" stroke="#1e293b" strokeWidth={8} strokeLinecap="round" />
        {/* Value arc */}
        {valPath && (
          <path d={valPath} fill="none" stroke={statusColor} strokeWidth={8} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${statusColor})`, transition: 'all 0.5s ease' }} />
        )}
        {/* Optimal zone indicators */}
        <circle cx={arcX(startAngle + (optimal[0] - min) / (max - min) * sweepAngle)} cy={arcY(startAngle + (optimal[0] - min) / (max - min) * sweepAngle)} r={3} fill="#22c55e" />
        <circle cx={arcX(startAngle + (optimal[1] - min) / (max - min) * sweepAngle)} cy={arcY(startAngle + (optimal[1] - min) / (max - min) * sweepAngle)} r={3} fill="#22c55e" />

        {/* Center value */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize={16} fontWeight="bold" fontFamily="monospace">
          {value !== null ? value.toFixed(1) : '--'}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize={9} fontFamily="sans-serif">
          {unit}
        </text>
      </svg>

      <div style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>{label}</div>

      {/* Status badge */}
      <div style={{
        background: `${statusColor}22`,
        border: `1px solid ${statusColor}`,
        borderRadius: 20,
        padding: '2px 10px',
        fontSize: 10,
        color: statusColor,
        fontWeight: 700,
        textTransform: 'uppercase',
      }}>
        {value === null ? 'NO DATA' : statusColor === '#22c55e' ? '✓ OPTIMAL' : statusColor === '#facc15' ? '⚠ MARGINAL' : '✗ CRITICAL'}
      </div>
    </div>
  );
}
