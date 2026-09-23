'use client';

import { useRef, useState, useEffect } from 'react';
import { Terminal, Trash2, PauseCircle, PlayCircle, ChevronDown } from 'lucide-react';
import { useFirewallStore } from '@/store/firewallStore';
import { SyslogEntry, SyslogLevel } from '@/lib/firewall-engine';

const levelStyles: Record<SyslogLevel, { color: string; bg: string; label: string }> = {
  ALLOW:    { color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: 'ALLOW   ' },
  DENY:     { color: '#FF3366', bg: 'rgba(255,51,102,0.08)',  label: 'DENY    ' },
  REJECT:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  label: 'REJECT  ' },
  STATEFUL: { color: '#00F0FF', bg: 'rgba(0,240,255,0.06)',   label: 'STATEFUL' },
  SYSTEM:   { color: '#64748b', bg: 'rgba(100,116,139,0.06)', label: 'SYSTEM  ' },
};

function formatTs(ts: number) {
  return new Date(ts).toISOString().replace('T', ' ').slice(0, 23);
}

function SyslogLine({ entry, highlight }: { entry: SyslogEntry; highlight?: boolean }) {
  const style = levelStyles[entry.level];
  return (
    <div
      className={`terminal-line px-3 py-1.5 transition-colors duration-300 rounded ${highlight ? 'animate-fade-in' : ''}`}
      style={{ background: highlight ? style.bg : 'transparent' }}
    >
      <span className="text-slate-600">[{formatTs(entry.timestamp)}] </span>
      <span className="font-bold" style={{ color: style.color }}>{style.label}</span>
      <span className="text-slate-300"> | </span>
      {entry.level !== 'SYSTEM' && (
        <>
          <span className="text-slate-400">{entry.protocol} </span>
          <span className="text-slate-300">{entry.srcIp}:{entry.srcPort}</span>
          <span className="text-slate-500"> → </span>
          <span className="text-slate-300">{entry.destIp}:{entry.destPort}</span>
          <span className="text-slate-500"> | </span>
        </>
      )}
      <span className="text-slate-400">{entry.rule}</span>
      {entry.level === 'SYSTEM' && (
        <>
          <span className="text-slate-500"> | </span>
          <span className="text-slate-500">{entry.message.split('] ')[1] || entry.message}</span>
        </>
      )}
    </div>
  );
}

interface SyslogTerminalProps {
  maxHeight?: string;
  showHeader?: boolean;
}

export default function SyslogTerminal({ maxHeight = '320px', showHeader = true }: SyslogTerminalProps) {
  const syslog = useFirewallStore(s => s.syslog);
  const clearSyslog = useFirewallStore(s => s.clearSyslog);
  const [frozen, setFrozen] = useState(false);
  const [filter, setFilter] = useState<SyslogLevel | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [lastCount, setLastCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll when not frozen
  useEffect(() => {
    if (!frozen && syslog.length !== lastCount) {
      setLastCount(syslog.length);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [syslog.length, frozen, lastCount]);

  const filtered = syslog.filter(e => {
    if (filter !== 'ALL' && e.level !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.message.toLowerCase().includes(q) || e.srcIp.includes(q) || e.destIp.includes(q);
    }
    return true;
  });

  const newIds = new Set(syslog.slice(0, 3).map(e => e.id));

  return (
    <div className="glass-panel overflow-hidden flex flex-col">
      {showHeader && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-border">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF3366]" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="w-3 h-3 rounded-full bg-[#10B981]" />
          </div>
          <Terminal className="w-4 h-4 text-[#00F0FF] ml-1" />
          <span className="font-mono text-xs font-bold text-white">Syslog Terminal</span>
          <span className="font-mono text-[10px] text-slate-500 ml-1">
            {filtered.length}/{syslog.length} entries
          </span>

          {/* Controls */}
          <div className="ml-auto flex items-center gap-2">
            {/* Filter */}
            <select
              id="syslog-filter"
              value={filter}
              onChange={e => setFilter(e.target.value as SyslogLevel | 'ALL')}
              className="bg-obsidian border border-slate-border rounded text-[10px] font-mono text-slate-400 px-2 py-1 focus:outline-none focus:border-[#00F0FF]"
            >
              <option value="ALL">ALL</option>
              <option value="ALLOW">ALLOW</option>
              <option value="DENY">DENY</option>
              <option value="REJECT">REJECT</option>
              <option value="STATEFUL">STATEFUL</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>

            <button
              id="syslog-freeze"
              onClick={() => setFrozen(!frozen)}
              className="p-1.5 rounded text-slate-500 hover:text-white transition-colors"
              title={frozen ? 'Resume auto-scroll' : 'Freeze scroll'}
            >
              {frozen ? <PlayCircle className="w-4 h-4 text-[#10B981]" /> : <PauseCircle className="w-4 h-4" />}
            </button>

            <button
              id="syslog-clear"
              onClick={clearSyslog}
              className="p-1.5 rounded text-slate-500 hover:text-[#FF3366] transition-colors"
              title="Clear log"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-border/50">
        <input
          id="syslog-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search log entries, IPs..."
          className="w-full bg-transparent font-mono text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
        />
      </div>

      {/* Log entries */}
      <div
        className="overflow-y-auto font-mono text-xs"
        style={{ maxHeight, minHeight: '120px' }}
      >
        {filtered.length === 0 ? (
          <div className="text-center text-slate-600 font-mono text-xs py-8">
            No entries match current filter.
          </div>
        ) : (
          <div className="flex flex-col-reverse">
            <div ref={bottomRef} />
            {filtered.map(entry => (
              <SyslogLine
                key={entry.id}
                entry={entry}
                highlight={newIds.has(entry.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-border/50 bg-obsidian/40">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
        <span className="font-mono text-[10px] text-slate-600">
          {frozen ? 'SCROLL FROZEN' : 'LIVE FEED'}
        </span>
        <span className="ml-auto font-mono text-[10px] text-slate-700">
          CryptoGuard Syslog v2.4 · NGFW
        </span>
      </div>
    </div>
  );
}
