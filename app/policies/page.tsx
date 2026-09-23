'use client';

import { useEffect } from 'react';
import { useFirewallStore } from '@/store/firewallStore';
import RuleManager from '@/components/RuleManager';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function PoliciesPage() {
  const conflicts = useFirewallStore(s => s.conflicts);
  const runAudit = useFirewallStore(s => s.runAudit);
  const rules = useFirewallStore(s => s.rules);

  // Auto-run audit on load
  useEffect(() => { runAudit(); }, [runAudit]);

  const criticalConflicts = conflicts.filter(c => c.severity === 'CRITICAL');
  const highConflicts = conflicts.filter(c => c.severity === 'HIGH');
  const lowConflicts = conflicts.filter(c => c.severity === 'LOW');

  const totalHits = rules.reduce((sum, r) => sum + r.hitCount, 0);

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Page header */}
      <div className="border-b border-slate-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img src="/icon.png" alt="Logo" className="w-5 h-5 rounded-md drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                <h1 className="font-mono text-2xl font-bold text-white">Rule Base</h1>
              </div>
              <p className="text-slate-400 text-sm">
                Manage, reorder, and audit your firewall access control list.
                Rules are evaluated top-to-bottom by priority.
              </p>
            </div>

            {/* Summary chips */}
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(0,240,255,0.06)] border border-[rgba(0,240,255,0.2)]">
                <img src="/icon.png" alt="Logo" className="w-3.5 h-3.5 rounded-sm drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                <span className="font-mono text-xs text-[#00F0FF]">{rules.length} rules</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.2)]">
                <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="font-mono text-xs text-[#10B981]">{totalHits} total hits</span>
              </div>
              {conflicts.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,51,102,0.06)] border border-[rgba(255,51,102,0.2)]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF3366]" />
                  <span className="font-mono text-xs text-[#FF3366]">{conflicts.length} conflicts</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Audit Summary */}
        {conflicts.length > 0 && (
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
              <h2 className="font-mono text-sm font-bold text-white">Policy Audit Report</h2>
              <span className="font-mono text-[10px] text-slate-500">{conflicts.length} issues found</span>
            </div>

            <div className="space-y-3">
              {conflicts.map((c, i) => {
                const color = c.severity === 'CRITICAL' ? '#FF3366' : c.severity === 'HIGH' ? '#F59E0B' : '#10B981';
                return (
                  <div key={i} className="flex gap-3 p-3 rounded-xl"
                    style={{ background: `${color}06`, border: `1px solid ${color}20` }}>
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ color, background: `${color}20` }}>
                          {c.type}
                        </span>
                        <span className="font-mono text-[10px] font-bold"
                          style={{ color }}>
                          [{c.severity}]
                        </span>
                      </div>
                      <p className="font-mono text-xs text-slate-400">{c.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {conflicts.length === 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(16,185,129,0.04)] border border-[rgba(16,185,129,0.15)]">
            <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
            <div className="font-mono text-xs text-[#10B981]">
              No policy conflicts detected. Click &quot;Run Audit&quot; to re-scan after making changes.
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(0,240,255,0.04)] border border-[rgba(0,240,255,0.1)]">
          <Info className="w-4 h-4 text-[#00F0FF] mt-0.5 shrink-0" />
          <div className="font-mono text-xs text-slate-400">
            <strong className="text-[#00F0FF]">Top-to-Bottom Evaluation:</strong> Rules are matched in strict priority order. 
            The first matching rule terminates evaluation. Drag rules to reorder. Lower priority number = evaluated first.
          </div>
        </div>

        {/* Rule Manager */}
        <RuleManager />
      </div>
    </div>
  );
}
