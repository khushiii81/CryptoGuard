'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Shield, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-border bg-obsidian/80 mt-auto">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00F0FF33] to-transparent" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/icon.png" alt="CryptoGuard Logo" width={24} height={24} className="w-6 h-6 rounded-md drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
              <span className="font-mono font-bold text-white">
                Crypto<span className="text-[#00F0FF]">Guard</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Firewall simulation engine. Real-time packet inspection, 
              stateful connection tracking, and policy conflict analysis.
            </p>

          </div>

          {/* Architecture */}
          <div>
            <h3 className="font-mono text-xs font-bold text-[#00F0FF] tracking-widest uppercase mb-4">
              Architecture
            </h3>
            <ul className="space-y-2">
              {[
                'Stateful Packet Inspection',
                'DMZ Isolation Layer',
                'Top-to-Bottom Rule Engine',
                'Implicit Default Deny',
                'Bidirectional State Tracking',
                'Policy Conflict Auditor',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-1 h-1 rounded-full bg-[#00F0FF]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Security */}
          <div>
            <h3 className="font-mono text-xs font-bold text-[#00F0FF] tracking-widest uppercase mb-4">
              Security Standards
            </h3>
            <div className="space-y-3">
              {[
                { label: 'OWASP Top 10 Aligned', color: '#10B981' },
                { label: 'Zero-Trust Ready', color: '#00F0FF' },
                { label: 'NIST Compliant', color: '#10B981' },
                { label: 'Defense-in-Depth', color: '#00F0FF' },
                { label: 'HSTS Enforced', color: '#10B981' },
              ].map(badge => (
                <div key={badge.label} className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider"
                    style={{
                      color: badge.color,
                      background: `${badge.color}15`,
                      border: `1px solid ${badge.color}30`,
                    }}
                  >
                    ✓ {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-mono text-xs font-bold text-[#00F0FF] tracking-widest uppercase mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Overview', href: '/' },
                { label: 'Live Engine', href: '/simulator' },
                { label: 'Rule Base', href: '/policies' },
                { label: 'Syslog Terminal', href: '/logs' },
                { label: 'Architecture Guide', href: '/docs' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-[#00F0FF] transition-colors duration-200 font-mono flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-[#00F0FF] transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-slate-border/50">
              <a
                href="https://github.com/khushiii81/CryptoGuard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                Source Repository
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-slate-500">
            © 2026 CryptoGuard · All rights reserved
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
