'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Zap, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { useFirewallStore } from '@/store/firewallStore';
import { Protocol, EvaluationResult } from '@/lib/firewall-engine';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const ipv4Regex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/;

const packetSchema = z.object({
  srcIp: z.string().regex(ipv4Regex, 'Invalid IPv4 address'),
  destIp: z.string().regex(ipv4Regex, 'Invalid IPv4 address'),
  srcPort: z.coerce.number().int().min(1).max(65535),
  destPort: z.coerce.number().int().min(1).max(65535),
  protocol: z.enum(['TCP', 'UDP', 'ICMP']),
  tcpFlags: z.array(z.string()).optional(),
});

// ─── Quick Presets ────────────────────────────────────────────────────────────
const presets = [
  {
    id: 'preset-web',
    label: 'Web Traffic (DMZ)',
    description: 'Legitimate HTTP to DMZ Web Server',
    data: {
      srcIp: '203.0.113.50',
      destIp: '192.168.100.10',
      srcPort: '51234',
      destPort: '80',
      protocol: 'TCP' as Protocol,
      tcpFlags: ['SYN'],
    },
    color: '#10B981',
  },
  {
    id: 'preset-mail',
    label: 'Mail Traffic (DMZ)',
    description: 'Legitimate SMTP to DMZ Mail Server',
    data: {
      srcIp: '203.0.113.50',
      destIp: '192.168.100.20',
      srcPort: '51234',
      destPort: '25',
      protocol: 'TCP' as Protocol,
      tcpFlags: ['SYN'],
    },
    color: '#10B981',
  },
  {
    id: 'preset-db-lateral',
    label: 'Lateral DB Access',
    description: 'DMZ Web Server querying LAN Database',
    data: {
      srcIp: '192.168.100.10',
      destIp: '10.0.0.5',
      srcPort: '54321',
      destPort: '3306',
      protocol: 'TCP' as Protocol,
      tcpFlags: ['SYN'],
    },
    color: '#10B981',
  },
  {
    id: 'preset-malicious-lateral',
    label: 'Lateral Malware',
    description: 'Compromised Mail Server attacking Workstation',
    data: {
      srcIp: '192.168.100.20',
      destIp: '192.168.1.50',
      srcPort: '44444',
      destPort: '445',
      protocol: 'TCP' as Protocol,
      tcpFlags: ['SYN'],
    },
    color: '#FF3366',
  },
  {
    id: 'preset-db-intrusion',
    label: 'External DB Intrusion',
    description: 'Direct Database Intrusion Attempt from WAN',
    data: {
      srcIp: '198.51.100.99',
      destIp: '10.0.0.5',
      srcPort: '54321',
      destPort: '3306',
      protocol: 'TCP' as Protocol,
      tcpFlags: ['SYN'],
    },
    color: '#FF3366',
  },
  {
    id: 'preset-ssh-brute',
    label: 'SSH Brute Force',
    description: 'SSH Brute Force from WAN to Internal Workstation',
    data: {
      srcIp: '198.51.100.77',
      destIp: '192.168.1.50',
      srcPort: '44444',
      destPort: '22',
      protocol: 'TCP' as Protocol,
      tcpFlags: ['SYN'],
    },
    color: '#F59E0B',
  },
];

const protocols: Protocol[] = ['TCP', 'UDP', 'ICMP'];
const tcpFlagOptions = ['SYN', 'ACK', 'FIN', 'RST', 'PSH', 'URG'];

interface PacketInjectorProps {
  onResult?: (result: EvaluationResult) => void;
}

export default function PacketInjector({ onResult }: PacketInjectorProps) {
  const injectPacket = useFirewallStore(s => s.injectPacket);

  const [form, setForm] = useState({
    srcIp: '203.0.113.50',
    destIp: '192.168.100.10',
    srcPort: '51234',
    destPort: '80',
    protocol: 'TCP' as Protocol,
    tcpFlags: ['SYN'] as string[],
    simulateResponse: false,
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [lastResult, setLastResult] = useState<EvaluationResult | null>(null);
  const [isInjecting, setIsInjecting] = useState(false);

  const applyPreset = (preset: typeof presets[0]) => {
    setForm(f => ({
      ...f,
      ...preset.data,
      srcPort: String(preset.data.srcPort),
      destPort: String(preset.data.destPort),
    }));
    setErrors({});
    setLastResult(null);
  };

  const toggleFlag = (flag: string) => {
    setForm(f => ({
      ...f,
      tcpFlags: f.tcpFlags.includes(flag)
        ? f.tcpFlags.filter(fl => fl !== flag)
        : [...f.tcpFlags, flag],
    }));
  };

  const handleInject = async () => {
    const parsed = packetSchema.safeParse({
      srcIp: form.srcIp,
      destIp: form.destIp,
      srcPort: form.srcPort,
      destPort: form.destPort,
      protocol: form.protocol,
      tcpFlags: form.tcpFlags,
    });

    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach(e => {
        errs[e.path[0] as string] = e.message;
      });
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsInjecting(true);

    // Slight delay for animation feel
    await new Promise(r => setTimeout(r, 300));

    const result = injectPacket({
      srcIp: parsed.data.srcIp,
      destIp: parsed.data.destIp,
      srcPort: parsed.data.srcPort,
      destPort: parsed.data.destPort,
      protocol: parsed.data.protocol,
      tcpFlags: parsed.data.tcpFlags,
      isResponse: form.simulateResponse,
    });

    setLastResult(result);
    onResult?.(result);
    setIsInjecting(false);
  };

  const resultColor =
    lastResult?.action === 'ALLOW' ? '#10B981'
    : lastResult?.action === 'DENY' ? '#FF3366'
    : lastResult?.isStatefulHit ? '#00F0FF'
    : '#F59E0B';

  const inputClass = (field: string) =>
    `w-full bg-obsidian/60 border rounded-lg px-3 py-2 font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors duration-200 ${
      errors[field]
        ? 'border-[#FF3366] focus:border-[#FF3366] focus:ring-[#FF3366]/30'
        : 'border-slate-border focus:border-[#00F0FF] focus:ring-[#00F0FF]/20'
    }`;

  return (
    <div className="glass-panel p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-border pb-4">
        <Zap className="w-4 h-4 text-[#00F0FF]" />
        <h2 className="font-mono text-sm font-bold text-white tracking-wider">Packet Injector</h2>
        <span className="ml-auto font-mono text-[10px] text-slate-500 bg-slate-border/40 px-2 py-0.5 rounded">
          NGFW INPUT
        </span>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="block font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
          Quick Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {presets.map(preset => (
            <motion.button
              key={preset.id}
              id={preset.id}
              onClick={() => applyPreset(preset)}
              whileHover={{ scale: 1.02, backgroundColor: `${preset.color}15` }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col gap-1 p-3 rounded-xl text-left transition-colors duration-200"
              style={{
                background: `${preset.color}08`,
                border: `1px solid ${preset.color}25`,
              }}
            >
              <span className="font-mono text-xs font-bold" style={{ color: preset.color }}>
                {preset.label}
              </span>
              <span className="font-mono text-[10px] text-slate-500 leading-tight">{preset.description}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Source IP */}
        <div>
          <label className="block font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">
            Source IP
          </label>
          <input
            id="src-ip-input"
            type="text"
            value={form.srcIp}
            onChange={e => setForm(f => ({ ...f, srcIp: e.target.value }))}
            placeholder="0.0.0.0"
            className={inputClass('srcIp')}
          />
          {errors.srcIp && <p className="mt-1 text-[10px] font-mono text-[#FF3366]">{errors.srcIp}</p>}
        </div>

        {/* Dest IP */}
        <div>
          <label className="block font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">
            Destination IP
          </label>
          <input
            id="dest-ip-input"
            type="text"
            value={form.destIp}
            onChange={e => setForm(f => ({ ...f, destIp: e.target.value }))}
            placeholder="0.0.0.0"
            className={inputClass('destIp')}
          />
          {errors.destIp && <p className="mt-1 text-[10px] font-mono text-[#FF3366]">{errors.destIp}</p>}
        </div>

        {/* Source Port */}
        <div>
          <label className="block font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">
            Source Port
          </label>
          <input
            id="src-port-input"
            type="number"
            value={form.srcPort}
            onChange={e => setForm(f => ({ ...f, srcPort: e.target.value }))}
            placeholder="1–65535"
            min={1}
            max={65535}
            className={inputClass('srcPort')}
          />
          {errors.srcPort && <p className="mt-1 text-[10px] font-mono text-[#FF3366]">{errors.srcPort}</p>}
        </div>

        {/* Dest Port */}
        <div>
          <label className="block font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">
            Dest Port
          </label>
          <input
            id="dest-port-input"
            type="number"
            value={form.destPort}
            onChange={e => setForm(f => ({ ...f, destPort: e.target.value }))}
            placeholder="1–65535"
            min={1}
            max={65535}
            className={inputClass('destPort')}
          />
          {errors.destPort && <p className="mt-1 text-[10px] font-mono text-[#FF3366]">{errors.destPort}</p>}
        </div>
      </div>

      {/* Protocol */}
      <div>
        <label className="block font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">
          Protocol
        </label>
        <div className="flex gap-2">
          {protocols.map(p => (
            <motion.button
              key={p}
              id={`protocol-${p.toLowerCase()}`}
              onClick={() => setForm(f => ({ ...f, protocol: p }))}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 rounded-lg font-mono text-xs font-bold transition-colors duration-200"
              style={
                form.protocol === p
                  ? { background: 'rgba(0,240,255,0.12)', border: '1px solid rgba(0,240,255,0.5)', color: '#00F0FF' }
                  : { background: 'rgba(30,45,74,0.3)', border: '1px solid rgba(30,45,74,0.8)', color: '#64748b' }
              }
            >
              {p}
            </motion.button>
          ))}
        </div>
      </div>

      {/* TCP Flags */}
      {form.protocol === 'TCP' && (
        <div>
          <label className="block font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">
            TCP Flags
          </label>
          <div className="flex flex-wrap gap-2">
            {tcpFlagOptions.map(flag => {
              const isActive = form.tcpFlags.includes(flag);
              return (
                <motion.button
                  key={flag}
                  id={`flag-${flag.toLowerCase()}`}
                  onClick={() => toggleFlag(flag)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-colors duration-200"
                  style={
                    isActive
                      ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', color: '#10B981' }
                      : { background: 'rgba(30,45,74,0.3)', border: '1px solid rgba(30,45,74,0.8)', color: '#475569' }
                  }
                >
                  {flag}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Response Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs text-white">Simulate Response Packet</div>
          <div className="font-mono text-[10px] text-slate-500">Check stateful table for return traffic</div>
        </div>
        <button
          id="response-toggle"
          onClick={() => setForm(f => ({ ...f, simulateResponse: !f.simulateResponse }))}
          className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
            form.simulateResponse ? 'bg-[#00F0FF]' : 'bg-slate-border'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
              form.simulateResponse ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {/* Inject Button */}
      <motion.button
        id="inject-packet-btn"
        onClick={handleInject}
        disabled={isInjecting}
        whileHover={!isInjecting ? { scale: 1.02, filter: 'brightness(1.15)' } : {}}
        whileTap={!isInjecting ? { scale: 0.98 } : {}}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-mono text-sm font-bold transition-colors duration-200 relative overflow-hidden"
        style={{
          background: isInjecting
            ? 'rgba(16,185,129,0.1)'
            : 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(0,240,255,0.1) 100%)',
          border: `1px solid ${isInjecting ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.6)'}`,
          color: '#10B981',
          boxShadow: isInjecting ? 'none' : '0 0 20px rgba(16,185,129,0.15)',
        }}
      >
        {isInjecting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Evaluating Packet...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Inject Packet
          </>
        )}
      </motion.button>

      {/* Result Badge */}
      {lastResult && (
        <div
          className="p-4 rounded-xl space-y-2"
          style={{
            background: `${resultColor}08`,
            border: `1px solid ${resultColor}30`,
          }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" style={{ color: resultColor }} />
            <span className="font-mono text-sm font-bold" style={{ color: resultColor }}>
              {lastResult.isStatefulHit ? 'STATEFUL HIT' : lastResult.action}
            </span>
            <span className="font-mono text-[10px] text-slate-500 ml-auto">
              Zone: {lastResult.zone}
            </span>
          </div>
          <p className="font-mono text-xs text-slate-400 leading-relaxed">
            {lastResult.reason}
          </p>
          {lastResult.matchedRule && (
            <div className="font-mono text-[10px] text-slate-500">
              Rule #{lastResult.matchedRule.priority}: {lastResult.matchedRule.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
