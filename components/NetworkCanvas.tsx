'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { EvaluationResult } from '@/lib/firewall-engine';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

// ─── Layout constants ─────────────────────────────────────────────────────────
const W = 900;
const H = 480;

const NODES = {
  internet:  { x: 60,  y: 240, label: 'INTERNET',      sub: '0.0.0.0/0',          color: '#FF3366', ring: '#FF336640' },
  extFw:     { x: 220, y: 240, label: 'EXT FIREWALL',  sub: 'WAN ↔ DMZ',           color: '#F59E0B', ring: '#F59E0B40' },
  dmzWeb:    { x: 400, y: 140, label: 'WEB SERVER',    sub: '192.168.100.10',       color: '#00F0FF', ring: '#00F0FF40' },
  dmzMail:   { x: 400, y: 340, label: 'MAIL SERVER',   sub: '192.168.100.20',       color: '#00F0FF', ring: '#00F0FF40' },
  intFw:     { x: 580, y: 240, label: 'INT FIREWALL',  sub: 'DMZ ↔ LAN',           color: '#F59E0B', ring: '#F59E0B40' },
  lanDb:     { x: 760, y: 140, label: 'DATABASE',      sub: '10.0.0.5',            color: '#10B981', ring: '#10B98140' },
  lanWs:     { x: 760, y: 340, label: 'WORKSTATION',   sub: '192.168.1.50',        color: '#10B981', ring: '#10B98140' },
};

// Paths: array of nodeIds the packet traverses
const ZONE_PATHS: Record<string, string[]> = {
  WAN_TO_DMZ:  ['internet', 'extFw', 'dmzWeb'],
  WAN_TO_LAN:  ['internet', 'extFw', 'intFw', 'lanDb'],
  DMZ_TO_LAN:  ['dmzWeb',  'intFw', 'lanDb'],
  ANY:         ['internet', 'extFw', 'dmzWeb'],
};

const GATE_FOR_ZONE: Record<string, string> = {
  WAN_TO_DMZ: 'extFw',
  WAN_TO_LAN: 'extFw',
  DMZ_TO_LAN: 'intFw',
  ANY:        'extFw',
};

// Connection lines to always render
const CONNECTIONS = [
  ['internet', 'extFw'],
  ['extFw', 'dmzWeb'],
  ['extFw', 'dmzMail'],
  ['extFw', 'intFw'],
  ['dmzWeb', 'intFw'],
  ['dmzMail', 'intFw'],
  ['intFw', 'lanDb'],
  ['intFw', 'lanWs'],
];

type NodeKey = keyof typeof NODES;

// ─── Fragment particle ────────────────────────────────────────────────────────
interface Fragment { id: number; x: number; y: number; vx: number; vy: number; color: string }

// ─── Node component ───────────────────────────────────────────────────────────
function NetworkNode({
  id, node, isGate, isActive, isPulsing, isBlocking,
}: {
  id: string;
  node: typeof NODES[NodeKey];
  isGate: boolean;
  isActive: boolean;
  isPulsing: boolean;
  isBlocking: boolean;
}) {
  const r = isGate ? 28 : 22;

  return (
    <g>
      {/* Outer ring pulse */}
      {(isActive || isPulsing) && (
        <motion.circle
          cx={node.x} cy={node.y} r={r + 12}
          fill="none" stroke={isBlocking ? '#FF3366' : node.color}
          strokeWidth={2}
          initial={{ r: r + 8, opacity: 0.8 }}
          animate={{ r: r + 28, opacity: 0 }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}

      {/* Blocking wall flash */}
      {isBlocking && (
        <>
          <motion.rect
            x={node.x - 6} y={node.y - 45}
            width={12} height={90}
            fill="#FF3366"
            initial={{ opacity: 0.9, scaleX: 1 }}
            animate={{ opacity: [0.9, 0.4, 0.9, 0], scaleX: [1, 1.5, 1, 1] }}
            transition={{ duration: 0.6 }}
            style={{ originX: `${node.x}px`, originY: `${node.y}px` }}
          />
          <motion.text
            x={node.x} y={node.y - 52}
            textAnchor="middle" fill="#FF3366"
            fontSize={9} fontFamily="monospace" fontWeight="bold"
            initial={{ opacity: 1, y: -52 }}
            animate={{ opacity: 0, y: -68 }}
            transition={{ duration: 0.6 }}
          >
            BLOCKED
          </motion.text>
        </>
      )}

      {/* Body */}
      <motion.circle
        cx={node.x} cy={node.y} r={r}
        fill={isBlocking ? '#FF336615' : isActive ? `${node.color}20` : '#111726'}
        stroke={isBlocking ? '#FF3366' : isActive ? node.color : `${node.color}60`}
        strokeWidth={isGate ? 2.5 : 1.5}
        animate={isBlocking
          ? { stroke: ['#FF3366', '#FF336688', '#FF3366'], scale: [1, 1.12, 1] }
          : isActive
          ? { stroke: [node.color, `${node.color}88`, node.color], scale: [1, 1.05, 1] }
          : {}}
        transition={{ duration: 0.4, repeat: isActive || isBlocking ? Infinity : 0 }}
      />

      {/* Icon area - shield for gate, hex for others */}
      {isGate ? (
        <text x={node.x} y={node.y + 4} textAnchor="middle"
          fill={isBlocking ? '#FF3366' : node.color} fontSize={14}>⬡</text>
      ) : (
        <text x={node.x} y={node.y + 4} textAnchor="middle"
          fill={isActive ? node.color : `${node.color}AA`} fontSize={12}>◈</text>
      )}

      {/* Label */}
      <text x={node.x} y={node.y + r + 14} textAnchor="middle"
        fill={isActive ? node.color : '#94A3B8'}
        fontSize={9} fontFamily="monospace" fontWeight="bold" letterSpacing={1}>
        {node.label}
      </text>
      <text x={node.x} y={node.y + r + 24} textAnchor="middle"
        fill="#475569" fontSize={7.5} fontFamily="monospace">
        {node.sub}
      </text>
    </g>
  );
}

// ─── Animated data-flow dots on idle connections ──────────────────────────────
function FlowDot({ x1, y1, x2, y2, delay }: { x1: number; y1: number; x2: number; y2: number; delay: number }) {
  return (
    <motion.circle
      r={2} fill="#00F0FF" opacity={0.4}
      initial={{ x: x1, y: y1, opacity: 0 }}
      animate={{ x: [x1, x2], y: [y1, y2], opacity: [0, 0.6, 0] }}
      transition={{ duration: 3, delay, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// ─── Main packet particle ─────────────────────────────────────────────────────
interface PacketAnimProps {
  path: string[];    // ordered node ids
  gateId: string;
  action: 'ALLOW' | 'DENY' | 'REJECT' | 'STATEFUL';
  onDone: () => void;
}

function PacketAnim({ path, gateId, action, onDone }: PacketAnimProps) {
  const [phase, setPhase] = useState<'pre-travel' | 'travel' | 'impact' | 'done'>('pre-travel');
  const [segIdx, setSegIdx] = useState(0);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [particlePos, setParticlePos] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  const color = action === 'ALLOW' || action === 'STATEFUL'
    ? (action === 'STATEFUL' ? '#00F0FF' : '#10B981')
    : action === 'DENY' ? '#FF3366' : '#F59E0B';

  const gateIndex = path.indexOf(gateId);
  // For DENY/REJECT: only travel up to gate
  const effectivePath = (action === 'ALLOW' || action === 'STATEFUL') ? path : path.slice(0, gateIndex + 1);

  const nodeAt = (id: string) => NODES[id as NodeKey];

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setPhase('travel');

      for (let i = 0; i < effectivePath.length - 1; i++) {
        if (cancelled) return;
        const from = nodeAt(effectivePath[i]);
        const to   = nodeAt(effectivePath[i + 1]);
        setSegIdx(i);

        // mid-control point for bezier feel
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2 - 20;

        await controls.start({
          x: [from.x, mx, to.x],
          y: [from.y, my, to.y],
          scale: [1, 1.3, 1],
          transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
        });

        if (cancelled) return;
        setParticlePos({ x: to.x, y: to.y });
      }

      // ── Impact phase ──
      if (cancelled) return;
      setPhase('impact');

      const gateNode = nodeAt(gateId);

      if (action === 'DENY' || action === 'REJECT') {
        // Spawn fragments
        const frags: Fragment[] = Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          return {
            id: i,
            x: gateNode.x,
            y: gateNode.y,
            vx: Math.cos(angle) * (15 + Math.random() * 20),
            vy: Math.sin(angle) * (15 + Math.random() * 20),
            color: i % 2 === 0 ? '#FF3366' : '#FF336688',
          };
        });
        setFragments(frags);
        await new Promise(r => setTimeout(r, 700));
      } else {
        // ALLOW ripple
        await new Promise(r => setTimeout(r, 500));
      }

      if (!cancelled) {
        setPhase('done');
        onDone();
      }
    }

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'done') return null;

  const startNode = nodeAt(effectivePath[0]);

  return (
    <>
      {/* The main packet orb */}
      {(phase === 'travel' || (phase === 'impact' && (action === 'ALLOW' || action === 'STATEFUL'))) && (
        <motion.g animate={controls} initial={{ x: startNode.x, y: startNode.y }}>
          {/* Glow */}
          <motion.circle
            r={14} fill={color} opacity={0.15}
            animate={{ r: [14, 20, 14] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          {/* Core */}
          <circle r={7} fill={color} filter={`drop-shadow(0 0 6px ${color})`} />
          {/* Pulse ring */}
          <motion.circle
            r={7} fill="none" stroke={color} strokeWidth={2}
            animate={{ r: [7, 18], opacity: [0.8, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          {/* Label */}
          <text y={-16} textAnchor="middle" fill={color}
            fontSize={8} fontFamily="monospace" fontWeight="bold">PKT</text>
        </motion.g>
      )}

      {/* ALLOW ripple at destination */}
      {phase === 'impact' && (action === 'ALLOW' || action === 'STATEFUL') && (() => {
        const dest = nodeAt(effectivePath[effectivePath.length - 1]);
        return (
          <g>
            {[0, 1, 2].map(i => (
              <motion.circle
                key={i}
                cx={dest.x} cy={dest.y}
                r={20}
                fill="none" stroke={color} strokeWidth={2}
                initial={{ r: 20, opacity: 0.9 }}
                animate={{ r: 60 + i * 15, opacity: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              />
            ))}
            <motion.circle
              cx={dest.x} cy={dest.y} r={10}
              fill={color}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 1.8, 0], opacity: [1, 0.6, 0] }}
              transition={{ duration: 0.5 }}
            />
          </g>
        );
      })()}

      {/* DENY/REJECT fragments */}
      {phase === 'impact' && fragments.map(f => (
        <motion.circle
          key={f.id}
          cx={f.x} cy={f.y}
          r={action === 'REJECT' ? 3.5 : 2.5}
          fill={f.color}
          initial={{ cx: f.x, cy: f.y, opacity: 1 }}
          animate={{
            cx: f.x + f.vx,
            cy: f.y + f.vy + 15,
            opacity: 0,
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}

      {/* REJECT: bounce-back arc */}
      {phase === 'impact' && action === 'REJECT' && (() => {
        const start = nodeAt(effectivePath[effectivePath.length - 1]);
        const orig  = nodeAt(effectivePath[0]);
        return (
          <motion.circle
            r={6} fill="#F59E0B"
            filter="drop-shadow(0 0 6px #F59E0B)"
            initial={{ x: start.x, y: start.y }}
            animate={{ x: [start.x, (start.x + orig.x) / 2, orig.x], y: [start.y, start.y - 50, orig.y] }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          />
        );
      })()}
    </>
  );
}

// ─── Zone label bands ─────────────────────────────────────────────────────────
function ZoneBands() {
  return (
    <>
      {/* WAN */}
      <rect x={10} y={10} width={165} height={H - 20} rx={8}
        fill="#FF336608" stroke="#FF336625" strokeWidth={1} />
      <text x={92} y={28} textAnchor="middle" fill="#FF336660"
        fontSize={9} fontFamily="monospace" fontWeight="bold" letterSpacing={2}>UNTRUSTED WAN</text>

      {/* DMZ */}
      <rect x={310} y={10} width={220} height={H - 20} rx={8}
        fill="#00F0FF06" stroke="#00F0FF20" strokeWidth={1} />
      <text x={420} y={28} textAnchor="middle" fill="#00F0FF55"
        fontSize={9} fontFamily="monospace" fontWeight="bold" letterSpacing={2}>DEMILITARIZED ZONE</text>

      {/* LAN */}
      <rect x={670} y={10} width={220} height={H - 20} rx={8}
        fill="#10B98108" stroke="#10B98122" strokeWidth={1} />
      <text x={780} y={28} textAnchor="middle" fill="#10B98155"
        fontSize={9} fontFamily="monospace" fontWeight="bold" letterSpacing={2}>CORPORATE LAN</text>
    </>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface NetworkCanvasProps {
  lastResult: EvaluationResult | null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NetworkCanvas({ lastResult }: NetworkCanvasProps) {
  const [activePacket, setActivePacket] = useState<{
    id: string;
    path: string[];
    gateId: string;
    action: 'ALLOW' | 'DENY' | 'REJECT' | 'STATEFUL';
  } | null>(null);

  const [glowingNodes, setGlowingNodes] = useState<Set<string>>(new Set());
  const [blockingGate, setBlockingGate] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const processedId = useRef<string | null>(null);

  // Idle ambient animations — track data-flow dot offsets
  const flowDots = CONNECTIONS.flatMap(([a, b], i) => [
    { x1: NODES[a as NodeKey].x, y1: NODES[a as NodeKey].y, x2: NODES[b as NodeKey].x, y2: NODES[b as NodeKey].y, delay: i * 0.6 },
    { x1: NODES[b as NodeKey].x, y1: NODES[b as NodeKey].y, x2: NODES[a as NodeKey].x, y2: NODES[a as NodeKey].y, delay: i * 0.6 + 1.5 },
  ]);

  useEffect(() => {
    if (!lastResult) return;
    const id = lastResult.packet.id;
    if (processedId.current === id) return;
    processedId.current = id;

    const zone = lastResult.zone;
    const rawPath = ZONE_PATHS[zone] || ZONE_PATHS['ANY'];
    const gateId  = GATE_FOR_ZONE[zone] || 'extFw';

    let action: 'ALLOW' | 'DENY' | 'REJECT' | 'STATEFUL';
    if (lastResult.isStatefulHit) action = 'STATEFUL';
    else if (lastResult.action === 'ALLOW') action = 'ALLOW';
    else if (lastResult.action === 'DENY') action = 'DENY';
    else action = 'REJECT';

    // Activate source node glow
    const srcNode = rawPath[0];
    setGlowingNodes(new Set([srcNode]));

    setActivePacket({ id, path: rawPath, gateId, action });

    if (action === 'DENY' || action === 'REJECT') {
      setTimeout(() => setBlockingGate(gateId), 500);
      setTimeout(() => setBlockingGate(null), 1200);
    }

    setTimeout(() => setGlowingNodes(new Set()), 2000);
  }, [lastResult]);

  const handlePacketDone = useCallback(() => setActivePacket(null), []);

  const isFirewall = (id: string) => id === 'extFw' || id === 'intFw';

  const viewBox = `0 0 ${W} ${H}`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800"
      style={{ background: 'linear-gradient(180deg, #060A14 0%, #0A0D1A 100%)', minHeight: 380 }}>

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 scanline" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-2.5 border-b border-slate-800/80"
        style={{ background: 'rgba(6,10,20,0.85)', backdropFilter: 'blur(8px)' }}>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
        </div>
        <span className="font-mono text-[10px] font-bold text-[#00F0FF] tracking-[0.2em] uppercase">
          CryptoGuard // Network Topology Visualizer
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="font-mono text-[9px] text-slate-600">v2.4 · NGFW-SIM</span>
          <span className="relative flex h-1.5 w-1.5 ml-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]" />
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-10 right-3 z-20 flex flex-col gap-1.5 mt-2">
        <button onClick={() => setZoom(z => Math.min(z + 0.15, 1.8))}
          className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-slate-500 hover:text-[#00F0FF] transition-colors">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.6))}
          className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-slate-500 hover:text-[#00F0FF] transition-colors">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setZoom(1)}
          className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-slate-500 hover:text-[#00F0FF] transition-colors">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Canvas */}
      <div className="pt-10 w-full overflow-x-auto">
        <svg
          viewBox={viewBox}
          style={{
            width: '100%',
            maxWidth: W,
            height: 'auto',
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s',
            display: 'block',
            margin: '0 auto',
          }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#0F1825" strokeWidth="0.5" />
            </pattern>
            {/* Glow filters */}
            <filter id="glow-cyan">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-red">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-green">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Arrowhead */}
            <marker id="arrow-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#00F0FF30" />
            </marker>
          </defs>

          {/* Background grid */}
          <rect width={W} height={H} fill="url(#grid)" />

          {/* Zone bands */}
          <ZoneBands />

          {/* Connection lines */}
          {CONNECTIONS.map(([a, b], i) => {
            const na = NODES[a as NodeKey];
            const nb = NODES[b as NodeKey];
            const mx = (na.x + nb.x) / 2;
            const my = (na.y + nb.y) / 2;
            const isOnActivePath = activePacket?.path.includes(a) && activePacket?.path.includes(b);
            return (
              <g key={i}>
                {/* Background line */}
                <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke="#1E2D4A" strokeWidth={1.5} />
                {/* Active path highlight */}
                {isOnActivePath && (
                  <motion.line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                    stroke={activePacket?.action === 'ALLOW' || activePacket?.action === 'STATEFUL' ? '#10B981' : '#FF3366'}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
                {/* Idle flow dots */}
                {!activePacket && <FlowDot x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} delay={i * 0.5} />}
              </g>
            );
          })}

          {/* Nodes */}
          {(Object.entries(NODES) as [NodeKey, typeof NODES[NodeKey]][]).map(([id, node]) => (
            <NetworkNode
              key={id}
              id={id}
              node={node}
              isGate={isFirewall(id)}
              isActive={glowingNodes.has(id)}
              isPulsing={activePacket?.path.includes(id) ?? false}
              isBlocking={blockingGate === id}
            />
          ))}

          {/* Animated Packet */}
          <AnimatePresence>
            {activePacket && (
              <PacketAnim
                key={activePacket.id}
                path={activePacket.path}
                gateId={activePacket.gateId}
                action={activePacket.action}
                onDone={handlePacketDone}
              />
            )}
          </AnimatePresence>
        </svg>
      </div>

      {/* Legend bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800/80 px-4 py-2 flex flex-wrap items-center gap-4"
        style={{ background: 'rgba(6,10,20,0.85)', backdropFilter: 'blur(8px)' }}>
        {[
          { color: '#10B981', label: 'ALLOW — passes through' },
          { color: '#FF3366', label: 'DENY — shatters at firewall' },
          { color: '#F59E0B', label: 'REJECT — deflects back' },
          { color: '#00F0FF', label: 'STATEFUL — session match' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 4px ${l.color}` }} />
            <span className="font-mono text-[9px] text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
