import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Zap, Shield, Lock, Activity, Network, GitBranch, Terminal, Eye, Server, Database, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Firewall Simulator — How packet filtering really works',
  description: 'Inject packets into a real firewall rule engine. Watch stateful inspection, DMZ isolation, and ACL evaluation play out live.',
};

const features = [
  { icon: <Network className="w-5 h-5" />, title: 'DMZ Isolation', desc: 'Three-zone segmentation: WAN → DMZ → LAN with dual firewall gates.', color: '#00F0FF', tag: 'ARCHITECTURE' },
  { icon: <Activity className="w-5 h-5" />, title: 'Stateful Inspection', desc: 'Bidirectional session tracking. Return traffic auto-permitted via state table.', color: '#10B981', tag: 'ENGINE' },
  { icon: <GitBranch className="w-5 h-5" />, title: 'Sequential ACL', desc: 'Top-to-bottom rule evaluation. First match terminates. Priority is everything.', color: '#00F0FF', tag: 'RULESET' },
  { icon: <Eye className="w-5 h-5" />, title: 'Conflict Auditor', desc: 'Auto-detect shadowed rules, redundant policies, insecure DMZ bypasses.', color: '#F59E0B', tag: 'AUDIT' },
  { icon: <Terminal className="w-5 h-5" />, title: 'SIEM Syslog', desc: 'Color-coded real-time log feed with ms-precision event timestamping.', color: '#10B981', tag: 'LOGGING' },
  { icon: <Lock className="w-5 h-5" />, title: 'Default Deny', desc: 'Fail-closed posture. Unknown traffic silently blocked by implicit deny.', color: '#FF3366', tag: 'SECURITY' },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060A14]">

      {/* ── Hexagonal grid background ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,1 55,15 55,37 30,51 5,37 5,15" fill="none" stroke="#00F0FF" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>

      {/* ── Radial glow at top ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center top, rgba(0,240,255,0.08) 0%, transparent 70%)' }} />

      {/* ── Hero ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: text */}
          <div>

            <h1 className="font-mono font-black text-5xl lg:text-6xl leading-[1.05] mb-6">
              <span className="block text-white">Network</span>
              <span className="block" style={{ color: '#00F0FF', textShadow: '0 0 40px rgba(0,240,255,0.4)' }}>
                Firewall
              </span>
              <span className="block text-white">Simulator.</span>
            </h1>

            <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-lg font-sans">
              Drop packets into a real rule engine. See exactly which ACL rule matches,
              how stateful sessions get tracked, and why your DMZ isn&apos;t as isolated as you think.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/simulator"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-mono text-sm font-bold transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#fff',
                  boxShadow: '0 0 30px rgba(16,185,129,0.35)',
                }}>
                <Zap className="w-4 h-4" />
                Inject a Packet
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/docs"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-mono text-sm font-bold border border-slate-700 text-slate-300 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all duration-200"
                style={{ background: 'rgba(17,23,38,0.6)' }}>
                <img src="/icon.png" alt="CryptoGuard Logo" className="w-4 h-4 rounded-sm drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                How It Works
              </Link>
            </div>

            {/* Micro stats */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-slate-800">
              {[
                { val: '10', label: 'ACL Rules' },
                { val: '3', label: 'Network Zones' },
                { val: '∞', label: 'Injections' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-mono text-2xl font-black text-white">{s.val}</div>
                  <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
              <div className="h-10 w-px bg-slate-800 mx-2" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="font-mono text-[10px] font-bold text-[#10B981]">OWASP ALIGNED</span>
              </div>
            </div>
          </div>

          {/* Right: Terminal-style architecture diagram */}
          <div className="relative hidden lg:block">
            <div className="rounded-2xl overflow-hidden border border-slate-800"
              style={{ background: '#060A14' }}>
              {/* Terminal chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800"
                style={{ background: '#0A0F1E' }}>
                <span className="w-3 h-3 rounded-full bg-[#FF3366]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="ml-3 font-mono text-[10px] text-slate-600">cryptoguard@firewall:~$</span>
              </div>

              {/* Architecture viz */}
              <div className="p-6">
                {/* Network path diagram */}
                {[
                  { label: 'INTERNET', ip: '0.0.0.0/0', color: '#FF3366', arrow: true },
                  { label: 'EXT FIREWALL', ip: 'WAN ↔ DMZ GATE', color: '#F59E0B', arrow: true },
                  { label: 'DMZ WEB SERVER', ip: '192.168.100.10:80', color: '#00F0FF', arrow: true },
                  { label: 'INT FIREWALL', ip: 'DMZ ↔ LAN GATE', color: '#F59E0B', arrow: true },
                  { label: 'DATABASE SERVER', ip: '10.0.0.5:3306', color: '#10B981', arrow: false },
                ].map((node, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex flex-col items-center" style={{ minWidth: 28 }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center border"
                        style={{ borderColor: `${node.color}40`, background: `${node.color}10` }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: node.color, boxShadow: `0 0 6px ${node.color}` }} />
                      </div>
                      {node.arrow && <div className="w-px h-6 bg-gradient-to-b from-slate-700 to-transparent mt-0.5" />}
                    </div>
                    <div className="pb-6">
                      <div className="font-mono text-xs font-bold" style={{ color: node.color }}>{node.label}</div>
                      <div className="font-mono text-[10px] text-slate-500 mt-0.5">{node.ip}</div>
                    </div>
                  </div>
                ))}

                {/* Syslog preview */}
                <div className="mt-4 p-3 rounded-lg border border-slate-800 font-mono text-[10px] space-y-1"
                  style={{ background: '#060A14' }}>
                  <div className="text-slate-700">{'// Live syslog output'}</div>
                  <div><span className="text-[#10B981]">ALLOW</span><span className="text-slate-600"> | TCP 203.0.113.50:51234 → 192.168.100.10:80</span></div>
                  <div><span className="text-[#FF3366]">DENY </span><span className="text-slate-600"> | TCP 198.51.100.99 → 10.0.0.5:3306</span></div>
                  <div><span className="text-[#F59E0B]">REJCT</span><span className="text-slate-600"> | TCP 198.51.100.77 → 192.168.1.50:22</span></div>
                  <div><span className="text-[#00F0FF]">STATE</span><span className="text-slate-600"> | ACK — Session match [SESSION:4a7b91]</span></div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold border"
              style={{ background: '#0A0F1E', borderColor: '#00F0FF30', color: '#00F0FF' }}>
              ZERO-TRUST READY
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.25em]">How it works</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i}
              className="group relative p-5 rounded-2xl border border-slate-800 transition-all duration-300 hover:border-slate-700 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0A0F1E 0%, #070B16 100%)' }}>
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle at top right, ${f.color}10 0%, transparent 70%)` }} />

              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-xl shrink-0"
                  style={{ background: `${f.color}12`, border: `1px solid ${f.color}25` }}>
                  <span style={{ color: f.color }}>{f.icon}</span>
                </div>
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded mt-1"
                  style={{ color: f.color, background: `${f.color}12`, border: `1px solid ${f.color}20` }}>
                  {f.tag}
                </span>
              </div>
              <h3 className="font-mono font-bold text-white text-sm mb-2 group-hover:text-[#00F0FF] transition-colors">
                {f.title}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-sans">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Attack Presets CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 p-8 lg:p-12"
          style={{ background: 'linear-gradient(135deg, #0A0F1E 0%, #060A14 100%)' }}>

          {/* Hex grid inside */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
            <rect width="100%" height="100%" fill="url(#hex)" />
          </svg>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="font-mono text-[10px] text-[#00F0FF] tracking-[0.2em] uppercase mb-3">Quick Attack Presets</div>
              <h2 className="font-mono text-2xl font-black text-white mb-3">
                Test These Scenarios
              </h2>
              <p className="text-slate-500 text-sm font-sans max-w-md">
                Each preset describes a real packet: source IP, destination port, protocol flags.
                The engine evaluates it against the ACL and returns ALLOW, DENY, or REJECT.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
              {[
                { label: 'HTTP → DMZ', port: ':80 TCP SYN', result: 'ALLOW', color: '#10B981' },
                { label: 'DB Intrusion', port: ':3306 TCP SYN', result: 'DENY', color: '#FF3366' },
                { label: 'SSH Brute', port: ':22 TCP SYN', result: 'REJECT', color: '#FF3366' },
                { label: 'Spoofed ACK', port: 'TCP ACK', result: 'STATEFUL', color: '#00F0FF' },
              ].map(p => (
                <div key={p.label}
                  className="px-4 py-3 rounded-xl border"
                  style={{ background: `${p.color}06`, borderColor: `${p.color}20` }}>
                  <div className="font-mono text-xs font-bold text-white mb-1">{p.label}</div>
                  <div className="font-mono text-[10px] text-slate-600 mb-2">{p.port}</div>
                  <div className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full inline-block"
                    style={{ color: p.color, background: `${p.color}15` }}>
                    → {p.result}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-8 flex items-center gap-4">
            <Link href="/simulator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-sm font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(0,240,255,0.08) 100%)',
                border: '1px solid rgba(0,240,255,0.4)',
                color: '#00F0FF',
              }}>
              <Zap className="w-4 h-4" />
              Inject Now
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/policies"
              className="font-mono text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
              Edit Rules <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
