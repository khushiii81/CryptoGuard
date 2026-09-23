'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirewallStore } from '@/store/firewallStore';
import { EvaluationResult } from '@/lib/firewall-engine';
import PacketInjector from '@/components/PacketInjector';
import SyslogTerminal from '@/components/SyslogTerminal';
import LiveStatsPanel from '@/components/LiveStatsPanel';
import { Shield, Database, Zap, ChevronRight, RefreshCw } from 'lucide-react';

const NetworkCanvas = dynamic(() => import('@/components/NetworkCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full flex items-center justify-center rounded-2xl border border-[#1A2540]"
      style={{ minHeight: 420, background: '#060A14' }}>
      <div className="text-center">
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-[#00F0FF] border-t-transparent mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="font-mono text-[11px] text-slate-600">Initializing topology engine...</div>
        <div className="font-mono text-[9px] text-slate-800 mt-1">Loading WebGL context</div>
      </div>
    </div>
  ),
});

// Verdict result card shown after packet injection
function VerdictCard({ result }: { result: EvaluationResult }) {
  const color = result.isStatefulHit ? '#00F0FF'
    : result.action === 'ALLOW' ? '#10B981'
    : result.action === 'DENY'  ? '#FF3366'
    : '#F59E0B';

  const label = result.isStatefulHit ? 'STATEFUL HIT'
    : result.action;

  const icon = result.action === 'ALLOW' || result.isStatefulHit ? '✓'
    : result.action === 'DENY' ? '✕' : '⟳';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="rounded-2xl p-4 border overflow-hidden relative"
      style={{ borderColor: `${color}30`, background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)` }}
    >
      {/* Glow corner */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2"
        style={{ background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` }} />

      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          {/* Big verdict icon */}
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-lg shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}40`, color }}
            animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 16px ${color}60`, `0 0 0px ${color}00`] }}
            transition={{ duration: 1.5, repeat: 3 }}
          >
            {icon}
          </motion.div>

          <div>
            <div className="font-mono text-sm font-black" style={{ color }}>{label}</div>
            <div className="font-mono text-[10px] text-slate-500">Zone: {result.zone}</div>
          </div>

          {/* Timestamp */}
          <div className="ml-auto font-mono text-[9px] text-slate-700">
            {new Date(result.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {/* Route */}
        <div className="font-mono text-[10px] text-slate-400 mb-2 truncate">
          <span className="text-slate-600">{result.packet.srcIp}:{result.packet.srcPort}</span>
          <span className="text-slate-700"> → </span>
          <span className="text-slate-600">{result.packet.destIp}:{result.packet.destPort}</span>
          <span className="text-slate-700"> [{result.packet.protocol}]</span>
        </div>

        {/* Rule ref */}
        <div className="font-mono text-[10px] leading-relaxed"
          style={{ color: `${color}CC` }}>
          {result.reason}
        </div>
      </div>
    </motion.div>
  );
}

export default function SimulatorPage() {
  const [lastResult, setLastResult] = useState<EvaluationResult | null>(null);
  const stateTable = useFirewallStore(s => s.stateTable);
  const rules = useFirewallStore(s => s.rules);
  const clearStateTable = useFirewallStore(s => s.clearStateTable);

  const enabledRules = rules.filter(r => r.enabled).length;
  const activeSessions = stateTable.length;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #060A14 0%, #050810 100%)' }}>
      {/* ── HUD top bar ── */}
      <div className="border-b border-[#1A2540]/80 sticky top-14 z-30"
        style={{ background: 'rgba(6,10,20,0.95)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-screen-2xl mx-auto px-4 py-2.5 flex flex-wrap items-center gap-3">

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>
            <span className="font-mono text-[11px] font-bold text-white tracking-wider uppercase">
              Live Simulation Engine
            </span>
          </div>

          <div className="h-4 w-px bg-[#1A2540] hidden sm:block" />

          {/* Live verdict flash */}
          <AnimatePresence mode="wait">
            {lastResult && (
              <motion.div key={lastResult.packet.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-md"
                style={{
                  color: lastResult.isStatefulHit ? '#00F0FF' : lastResult.action === 'ALLOW' ? '#10B981' : lastResult.action === 'DENY' ? '#FF3366' : '#F59E0B',
                  background: lastResult.isStatefulHit ? 'rgba(0,240,255,0.08)' : lastResult.action === 'ALLOW' ? 'rgba(16,185,129,0.08)' : lastResult.action === 'DENY' ? 'rgba(255,51,102,0.08)' : 'rgba(245,158,11,0.08)',
                }}>
                ▶ {lastResult.isStatefulHit ? 'STATEFUL' : lastResult.action} — {lastResult.packet.srcIp}:{lastResult.packet.destPort}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {[
              { v: `${enabledRules}`, l: 'Rules',    c: '#00F0FF' },
              { v: `${activeSessions}`, l: 'Sessions', c: '#10B981' },
            ].map(s => (
              <div key={s.l} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] font-bold"
                style={{ color: s.c, background: `${s.c}0D`, border: `1px solid ${s.c}20` }}>
                <span>{s.v}</span>
                <span className="text-slate-600 font-normal">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-6">

            {/* 3D Canvas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <NetworkCanvas lastResult={lastResult} />
            </motion.div>

            {/* Stats + Syslog row */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <SyslogTerminal maxHeight="240px" showHeader />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="md:w-72"
              >
                <LiveStatsPanel />
              </motion.div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-6">

            {/* Packet Injector */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <PacketInjector onResult={setLastResult} />
            </motion.div>

            {/* Verdict card */}
            <AnimatePresence mode="wait">
              {lastResult && (
                <motion.div
                  key={lastResult.packet.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <VerdictCard result={lastResult} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connection State Table */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="rounded-2xl border border-[#1A2540] overflow-hidden hud-corner"
              style={{ background: '#080C18' }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1A2540]">
                <Database className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span className="font-mono text-xs font-bold text-white">Connection State Table</span>
                <motion.div
                  key={activeSessions}
                  initial={{ scale: 1.4, color: '#00F0FF' }}
                  animate={{ scale: 1, color: '#475569' }}
                  className="ml-auto font-mono text-[10px]"
                >
                  {activeSessions} sessions
                </motion.div>
                {activeSessions > 0 && (
                  <button onClick={clearStateTable}
                    className="p-1 rounded text-slate-600 hover:text-[#FF3366] transition-colors ml-1">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="p-3 max-h-52 overflow-y-auto">
                <AnimatePresence>
                  {stateTable.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="font-mono text-[11px] text-[#1A2540] mb-1">◈ No active sessions</div>
                      <div className="font-mono text-[9px] text-[#111827]">
                        Inject an ALLOW packet to establish a session
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stateTable.map((s, i) => (
                        <motion.div
                          key={s.sessionId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-3 rounded-xl font-mono"
                          style={{ background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.08)' }}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[9px] font-bold text-[#00F0FF]">
                              {s.sessionId.slice(0, 8)}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-px rounded"
                              style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)' }}>
                              {s.state}
                            </span>
                            <span className="text-[9px] text-slate-600 ml-auto">{s.protocol}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {s.clientIp}:{s.clientPort}
                            <span className="text-slate-700 mx-1">⇄</span>
                            {s.serverIp}:{s.serverPort}
                          </div>
                          <div className="text-[9px] text-slate-700 mt-0.5">
                            {new Date(s.timestamp).toLocaleTimeString()}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Quick nav */}
            <div className="flex gap-3">
              <Link href="/policies"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs font-bold border border-[#1A2540] text-slate-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-all">
                <Shield className="w-3.5 h-3.5" />
                Rule Base
              </Link>
              <Link href="/logs"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs font-bold border border-[#1A2540] text-slate-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-all">
                <Zap className="w-3.5 h-3.5" />
                Full Logs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


