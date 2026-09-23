import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Shield, Network, Activity, Lock, ChevronRight, Info, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Architecture Guide',
  description: 'Interactive documentation covering Defense-in-Depth, Stateful vs Stateless filtering, DMZ architecture, and OWASP security standards.',
};

const sections = [
  {
    id: 'defense-in-depth',
    title: 'Defense-in-Depth Architecture',
    icon: <Image src="/icon.png" alt="Logo" width={20} height={20} className="w-5 h-5 rounded-sm drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />,
    color: '#00F0FF',
    content: [
      {
        heading: 'Layered Security Model',
        text: `Defense-in-Depth is a security strategy that employs multiple, independent layers of protection. 
        If one layer fails, the next layer stops the attack. CryptoGuard implements this with three distinct network 
        zones: the Untrusted WAN, the Demilitarized Zone (DMZ), and the trusted Corporate LAN.`,
      },
      {
        heading: 'Three-Zone Segmentation',
        text: `The WAN zone contains all external, untrusted traffic from the internet. 
        The DMZ is a semi-trusted buffer zone housing public-facing servers (web, mail). 
        The LAN is the fully trusted internal network containing sensitive assets (databases, workstations).`,
      },
      {
        heading: 'Dual Firewall Design',
        text: `Two independent firewall gates enforce policy between zones:
        • External Firewall (WAN ↔ DMZ): Permits only specific ports to DMZ servers
        • Internal Firewall (DMZ ↔ LAN): Strictly limits which DMZ services can reach internal systems
        This prevents a compromised DMZ server from directly accessing the LAN.`,
      },
    ],
  },
  {
    id: 'stateful-vs-stateless',
    title: 'Stateful vs. Stateless Packet Filtering',
    icon: <Activity className="w-5 h-5" />,
    color: '#10B981',
    content: [
      {
        heading: 'Stateless (Packet Filter)',
        text: `A stateless firewall evaluates each packet independently against a fixed rule set. 
        It cannot distinguish between a new connection attempt and response traffic from an established session. 
        This requires explicit rules for both outbound and inbound return traffic, which is operationally complex.`,
      },
      {
        heading: 'Stateful Inspection',
        text: `CryptoGuard implements Stateful Packet Inspection (SPI). When an ALLOW rule matches an outbound packet, 
        the engine creates a connection state entry tracking the 5-tuple: (srcIP, srcPort, destIP, destPort, protocol).
        Subsequent return traffic matching the reverse 5-tuple is automatically permitted via the state table, 
        without requiring an explicit inbound rule.`,
      },
      {
        heading: 'Bidirectional Return Verification',
        text: `When a response packet arrives, CryptoGuard first queries the connection state table for a matching 
        established session. If found, the packet is immediately allowed as a STATEFUL HIT, bypassing full rule 
        evaluation. Sessions expire after 1 hour of inactivity. This prevents spoofed ACK attacks on stateless firewalls.`,
      },
    ],
  },
  {
    id: 'sequential-evaluation',
    title: 'Top-to-Bottom Sequential Rule Evaluation',
    icon: <Network className="w-5 h-5" />,
    color: '#00F0FF',
    content: [
      {
        heading: 'Priority-Based Matching',
        text: `CryptoGuard's rule engine sorts all active rules by priority number (ascending). 
        When a packet arrives, the engine iterates through rules from lowest priority number to highest. 
        The FIRST rule whose criteria match the packet terminates evaluation and its action is applied.`,
      },
      {
        heading: 'Rule Ordering Is Critical',
        text: `A common misconfiguration is placing a broad "ALLOW any-to-any" rule before a specific "DENY" rule. 
        The broad rule shadows the specific rule, making it permanently unreachable. 
        CryptoGuard's Policy Auditor automatically detects these shadowing relationships.`,
      },
      {
        heading: 'Implicit Default Deny',
        text: `If a packet traverses the entire rule base without matching any rule, the implicit default deny 
        policy activates. The packet is silently blocked with no response to the sender. 
        This "fail-closed" design ensures unknown traffic is never inadvertently permitted.`,
      },
    ],
  },
  {
    id: 'owasp',
    title: 'OWASP Top 10 & Security Hardening',
    icon: <Lock className="w-5 h-5" />,
    color: '#F59E0B',
    content: [
      {
        heading: 'Security Headers (A05:2021)',
        text: `CryptoGuard enforces strict HTTP response headers:
        • Content-Security-Policy (CSP): Restricts script/style/font origins
        • X-Frame-Options: DENY — Prevents clickjacking
        • X-Content-Type-Options: nosniff — Prevents MIME sniffing
        • Strict-Transport-Security (HSTS): Forces HTTPS for 2 years
        • Referrer-Policy: strict-origin-when-cross-origin`,
      },
      {
        heading: 'Input Validation (A03:2021)',
        text: `All user input in the Packet Injector is validated server-side using Zod schemas before processing:
        • IPv4 addresses validated with regex: 0.0.0.0 to 255.255.255.255
        • Port numbers validated as integers in range 1–65535
        • Protocol enforced as enum: TCP | UDP | ICMP
        This prevents injection attacks from malformed packet descriptors.`,
      },
      {
        heading: 'Permissions Policy & Zero-Trust',
        text: `The Permissions-Policy header disables browser APIs not required by the application:
        camera=(), microphone=(), geolocation=(), interest-cohort=()
        
        Zero-Trust principles are applied to network zone design — no implicit trust between zones. 
        Every cross-zone communication requires an explicit ALLOW rule.`,
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      {/* Hero */}
      <div className="border-b border-slate-border relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-[#00F0FF]" />
            <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">Architecture Guide</span>
          </div>
          <h1 className="font-mono text-3xl sm:text-4xl font-bold text-white mb-4">
            CryptoGuard Technical Reference
          </h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            In-depth documentation covering the defense architecture, packet inspection models, 
            sequential ACL evaluation, and OWASP security hardening applied to this platform.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Table of Contents */}
        <div className="glass-panel p-5 mb-10">
          <h2 className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-3">Contents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="font-mono text-sm text-slate-300 group-hover:text-white transition-colors">
                  {s.title}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map(section => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              {/* Section header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-border">
                <div className="p-2.5 rounded-xl" style={{ background: `${section.color}10`, border: `1px solid ${section.color}20` }}>
                  <span style={{ color: section.color }}>{section.icon}</span>
                </div>
                <h2 className="font-mono text-xl font-bold text-white">{section.title}</h2>
              </div>

              <div className="space-y-6">
                {section.content.map((item, i) => (
                  <div key={i} className="glass-panel p-6">
                    <h3 className="font-mono text-sm font-bold mb-3" style={{ color: section.color }}>
                      {item.heading}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 glass-panel p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="relative">
            <h3 className="font-mono text-xl font-bold text-white mb-3">Ready to Simulate?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Apply what you&apos;ve learned. Inject packets, audit policies, and observe stateful behavior in action.
            </p>
            <Link href="/simulator" className="btn-cyber-emerald inline-flex">
              <Zap className="w-4 h-4" />
              Open Live Engine
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
