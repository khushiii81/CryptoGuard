'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useFirewallStore } from '@/store/firewallStore';

// Mini real-time bar chart for allow/deny distribution
function MiniBarChart({ data, colors }: { data: number[]; colors: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="data-bar">
      {data.map((v, i) => (
        <div
          key={i}
          className="data-bar-col"
          style={{
            height: `${Math.max(4, (v / max) * 100)}%`,
            background: colors[i % colors.length],
            opacity: 0.75 + (i / data.length) * 0.25,
          }}
        />
      ))}
    </div>
  );
}

// Sparkline SVG
function Sparkline({ values, color, height = 36 }: { values: number[]; color: string; height?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 120;
  const h = height;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - (v / max) * (h - 4)}`).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={`drop-shadow(0 0 3px ${color})`}
      />
      <polygon
        points={`0,${h} ${points} ${(values.length - 1) * step},${h}`}
        fill={`url(#spark-grad-${color.replace('#','')})`}
      />
    </svg>
  );
}

// Donut / arc gauge
function ArcGauge({ value, max, color, label, size = 72 }: {
  value: number; max: number; color: string; label: string; size?: number;
}) {
  const pct = Math.min(value / Math.max(max, 1), 1);
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A2540" strokeWidth={6} />
        {/* Arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          filter={`drop-shadow(0 0 4px ${color})`}
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)' }}
        />
        {/* Label */}
        <text x={cx} y={cy + 4} textAnchor="middle" fill={color}
          fontSize={size * 0.22} fontFamily="monospace" fontWeight="bold">
          {value}
        </text>
      </svg>
      <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function LiveStatsPanel() {
  const syslog = useFirewallStore(s => s.syslog);

  const stats = useMemo(() => {
    const allow    = syslog.filter(e => e.level === 'ALLOW').length;
    const deny     = syslog.filter(e => e.level === 'DENY').length;
    const reject   = syslog.filter(e => e.level === 'REJECT').length;
    const stateful = syslog.filter(e => e.level === 'STATEFUL').length;
    const total    = allow + deny + reject + stateful;

    // Last 20 entries time-series (1 = event, 0 = no event bucketed)
    const recent = syslog.slice(0, 20).reverse();
    const allowSeries  = recent.map(e => e.level === 'ALLOW' ? 1 : 0);
    const denySeries   = recent.map(e => e.level === 'DENY' || e.level === 'REJECT' ? 1 : 0);

    const threatPct = total > 0 ? Math.round(((deny + reject) / total) * 100) : 0;

    return { allow, deny, reject, stateful, total, allowSeries, denySeries, threatPct };
  }, [syslog]);

  return (
    <div className="panel p-4 space-y-4 hud-corner">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-[#1A2540]">
        <span className="font-mono text-[10px] font-bold text-[#00F0FF] tracking-[0.2em] uppercase">
          Live Analytics
        </span>
        <span className="ml-auto font-mono text-[9px] text-slate-600">{stats.total} events</span>
      </div>

      {/* Gauges row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ArcGauge value={stats.allow}    max={Math.max(stats.total,1)} color="#10B981" label="Allow"    size={68} />
        <ArcGauge value={stats.deny}     max={Math.max(stats.total,1)} color="#FF3366" label="Deny"     size={68} />
        <ArcGauge value={stats.reject}   max={Math.max(stats.total,1)} color="#F59E0B" label="Reject"   size={68} />
        <ArcGauge value={stats.stateful} max={Math.max(stats.total,1)} color="#00F0FF" label="Stateful" size={68} />
      </div>

      {/* Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="font-mono text-[9px] text-[#10B981] mb-1 uppercase tracking-wider">Allow Trend</div>
          <Sparkline values={stats.allowSeries.length ? stats.allowSeries : [0,0]} color="#10B981" />
        </div>
        <div>
          <div className="font-mono text-[9px] text-[#FF3366] mb-1 uppercase tracking-wider">Threat Trend</div>
          <Sparkline values={stats.denySeries.length ? stats.denySeries : [0,0]} color="#FF3366" />
        </div>
      </div>

      {/* Threat level bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Threat Ratio</span>
          <span className="font-mono text-[10px] font-bold"
            style={{ color: stats.threatPct > 50 ? '#FF3366' : stats.threatPct > 25 ? '#F59E0B' : '#10B981' }}>
            {stats.threatPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[#1A2540] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${stats.threatPct}%`,
              background: stats.threatPct > 50 ? '#FF3366'
                : stats.threatPct > 25 ? '#F59E0B' : '#10B981',
              boxShadow: `0 0 8px ${stats.threatPct > 50 ? '#FF3366' : stats.threatPct > 25 ? '#F59E0B' : '#10B981'}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
