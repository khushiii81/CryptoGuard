'use client';

import SyslogTerminal from '@/components/SyslogTerminal';
import { ScrollText } from 'lucide-react';

export default function LogsPage() {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col">
      {/* Page header */}
      <div className="border-b border-slate-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-[#00F0FF]" />
            <h1 className="font-mono text-2xl font-bold text-white">Syslog Terminal</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Full-screen real-time security event log. Color-coded by action: 
            <span className="text-[#10B981] font-mono"> ALLOW</span> ·
            <span className="text-[#FF3366] font-mono"> DENY</span> ·
            <span className="text-[#F59E0B] font-mono"> REJECT</span> ·
            <span className="text-[#00F0FF] font-mono"> STATEFUL</span>
          </p>
        </div>
      </div>

      {/* Full-screen terminal */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <SyslogTerminal maxHeight="calc(100vh - 280px)" showHeader />
      </div>
    </div>
  );
}
