'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Trash2, Plus, Shield, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, AlertTriangle, AlertCircle, Info
} from 'lucide-react';
import { useFirewallStore } from '@/store/firewallStore';
import { FirewallRule, PolicyConflict, Action, Protocol, Zone } from '@/lib/firewall-engine';

// ─── Sortable Rule Row ────────────────────────────────────────────────────────

function SortableRuleRow({
  rule,
  conflicts,
  onDelete,
  onToggle,
}: {
  rule: FirewallRule;
  conflicts: PolicyConflict[];
  index: number;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [expanded, setExpanded] = useState(false);

  const ruleConflicts = conflicts.filter(c => c.ruleId === rule.id);
  const hasCritical = ruleConflicts.some(c => c.severity === 'CRITICAL');
  const hasHigh = ruleConflicts.some(c => c.severity === 'HIGH');

  const actionColor = rule.action === 'ALLOW' ? '#10B981' : rule.action === 'DENY' ? '#FF3366' : '#F59E0B';
  const conflictColor = hasCritical ? '#FF3366' : hasHigh ? '#F59E0B' : '#64748b';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-[0.98] shadow-cyan' : ''
      } ${!rule.enabled ? 'opacity-40' : ''}`}
      id={`rule-${rule.id}`}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: hasCritical ? 'rgba(255,51,102,0.04)' : 'rgba(17,23,38,0.8)',
          borderColor: hasCritical ? 'rgba(255,51,102,0.2)' : hasHigh ? 'rgba(245,158,11,0.2)' : 'rgba(30,45,74,0.8)',
          borderRadius: '0.75rem',
          borderWidth: '1px',
          borderStyle: 'solid',
        }}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1 touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Priority Badge */}
        <div className="flex items-center justify-center w-9 h-7 rounded-lg bg-obsidian border border-slate-border font-mono text-xs font-bold text-slate-400 shrink-0">
          #{rule.priority}
        </div>

        {/* Action Badge */}
        <span
          className="hidden sm:inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0"
          style={{ color: actionColor, background: `${actionColor}18`, border: `1px solid ${actionColor}30` }}
        >
          {rule.action}
        </span>

        {/* Description */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm text-white truncate">{rule.description}</div>
          <div className="font-mono text-[10px] text-slate-500 truncate">
            {rule.protocol} · {rule.srcIp}:{rule.srcPort} → {rule.destIp}:{rule.destPort} · {rule.zone}
          </div>
        </div>

        {/* Hit Counter */}
        <div className="hidden md:flex flex-col items-center shrink-0">
          <span className="font-mono text-xs font-bold text-[#00F0FF]">{rule.hitCount}</span>
          <span className="font-mono text-[9px] text-slate-600">hits</span>
        </div>

        {/* Conflict indicator */}
        {ruleConflicts.length > 0 && (
          <AlertTriangle
            className="w-4 h-4 shrink-0"
            style={{ color: conflictColor, filter: `drop-shadow(0 0 4px ${conflictColor})` }}
          />
        )}

        {/* Controls */}
        <button
          onClick={onToggle}
          className="p-1 text-slate-500 hover:text-white transition-colors shrink-0"
          title={rule.enabled ? 'Disable rule' : 'Enable rule'}
        >
          {rule.enabled
            ? <ToggleRight className="w-5 h-5 text-[#10B981]" />
            : <ToggleLeft className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-slate-500 hover:text-white transition-colors shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <button
          onClick={onDelete}
          className="p-1 text-slate-600 hover:text-[#FF3366] transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-slate-border/50 mt-0.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 font-mono text-xs">
            {[
              ['Zone', rule.zone],
              ['Protocol', rule.protocol],
              ['Src IP', rule.srcIp],
              ['Dest IP', rule.destIp],
              ['Src Port', rule.srcPort],
              ['Dest Port', rule.destPort],
              ['Action', rule.action],
              ['Hits', String(rule.hitCount)],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <span className="text-slate-600 text-[10px] uppercase tracking-wider">{k}</span>
                <span className="text-slate-300">{v}</span>
              </div>
            ))}
          </div>

          {/* Conflicts */}
          {ruleConflicts.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-border/30">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Conflicts Detected</div>
              {ruleConflicts.map((c, i) => (
                <div key={i} className="flex gap-2 p-2 rounded-lg"
                  style={{ background: `${conflictColor}08`, border: `1px solid ${conflictColor}20` }}>
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: conflictColor }} />
                  <div>
                    <span className="font-mono text-[10px] font-bold" style={{ color: conflictColor }}>
                      [{c.type}][{c.severity}]{' '}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{c.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Rule Modal ───────────────────────────────────────────────────────────

function AddRuleModal({ onClose }: { onClose: () => void }) {
  const addRule = useFirewallStore(s => s.addRule);
  const rules = useFirewallStore(s => s.rules);
  const maxPriority = Math.max(...rules.map(r => r.priority), 0);

  const [form, setForm] = useState({
    priority: maxPriority + 10,
    zone: 'WAN_TO_DMZ' as Zone,
    srcIp: 'any',
    destIp: 'any',
    srcPort: 'any',
    destPort: 'any',
    protocol: 'TCP' as Protocol,
    action: 'DENY' as Action,
    description: '',
    enabled: true,
  });

  const handleSubmit = () => {
    addRule(form);
    onClose();
  };

  const inputClass = 'w-full bg-obsidian border border-slate-border rounded-lg px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-[#00F0FF] transition-colors';
  const selectClass = inputClass;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 border-b border-slate-border pb-4">
          <Plus className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="font-mono text-sm font-bold text-white">Add Firewall Rule</h3>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white font-mono text-xs">
            ✕ Close
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Priority</label>
            <input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: +e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Zone</label>
            <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value as Zone }))} className={selectClass}>
              <option value="WAN_TO_DMZ">WAN_TO_DMZ</option>
              <option value="DMZ_TO_LAN">DMZ_TO_LAN</option>
              <option value="WAN_TO_LAN">WAN_TO_LAN</option>
              <option value="ANY">ANY</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Source IP</label>
            <input value={form.srcIp} onChange={e => setForm(f => ({ ...f, srcIp: e.target.value }))} className={inputClass} placeholder="any or 192.168.1.0/24" />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Dest IP</label>
            <input value={form.destIp} onChange={e => setForm(f => ({ ...f, destIp: e.target.value }))} className={inputClass} placeholder="any or 10.0.0.5" />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Src Port</label>
            <input value={form.srcPort} onChange={e => setForm(f => ({ ...f, srcPort: e.target.value }))} className={inputClass} placeholder="any or 1024-2048" />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Dest Port</label>
            <input value={form.destPort} onChange={e => setForm(f => ({ ...f, destPort: e.target.value }))} className={inputClass} placeholder="any or 80" />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Protocol</label>
            <select value={form.protocol} onChange={e => setForm(f => ({ ...f, protocol: e.target.value as Protocol }))} className={selectClass}>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
              <option value="ANY">ANY</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Action</label>
            <select value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value as Action }))} className={selectClass}>
              <option value="ALLOW">ALLOW</option>
              <option value="DENY">DENY</option>
              <option value="REJECT">REJECT</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] text-slate-500 uppercase mb-1">Description</label>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass} placeholder="Rule description..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSubmit} className="flex-1 btn-cyber-emerald justify-center text-xs py-2.5">
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
          <button onClick={onClose} className="btn-cyber text-xs py-2.5 px-4">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Rule Manager ─────────────────────────────────────────────────────────────

export default function RuleManager() {
  const rules = useFirewallStore(s => s.rules);
  const deleteRule = useFirewallStore(s => s.deleteRule);
  const toggleRule = useFirewallStore(s => s.toggleRule);
  const reorderRules = useFirewallStore(s => s.reorderRules);
  const resetRules = useFirewallStore(s => s.resetRules);
  const runAudit = useFirewallStore(s => s.runAudit);
  const conflicts = useFirewallStore(s => s.conflicts);

  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const fromIndex = rules.findIndex(r => r.id === active.id);
      const toIndex = rules.findIndex(r => r.id === over?.id);
      reorderRules(fromIndex, toIndex);
    }
  };

  const criticalCount = conflicts.filter(c => c.severity === 'CRITICAL').length;
  const highCount = conflicts.filter(c => c.severity === 'HIGH').length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Image src="/icon.png" alt="Logo" width={16} height={16} className="w-4 h-4 rounded-sm drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
          <span className="font-mono text-sm font-bold text-white">Rule Base</span>
          <span className="font-mono text-xs text-slate-500">({rules.length} rules)</span>
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          {/* Conflict summary */}
          {conflicts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,51,102,0.08)] border border-[rgba(255,51,102,0.2)]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF3366]" />
              <span className="font-mono text-[10px] text-[#FF3366]">
                {criticalCount > 0 && `${criticalCount} CRITICAL`}
                {criticalCount > 0 && highCount > 0 && ' · '}
                {highCount > 0 && `${highCount} HIGH`}
              </span>
            </div>
          )}

          <button
            id="run-audit-btn"
            onClick={runAudit}
            className="btn-cyber text-xs py-2 px-3"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Run Audit
          </button>

          <button
            id="add-rule-btn"
            onClick={() => setShowAddModal(true)}
            className="btn-cyber-emerald text-xs py-2 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Rule
          </button>

          <button
            id="reset-rules-btn"
            onClick={resetRules}
            className="btn-cyber-crimson text-xs py-2 px-3"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Conflicts banner */}
      {criticalCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(255,51,102,0.06)] border border-[rgba(255,51,102,0.2)]">
          <AlertTriangle className="w-4 h-4 text-[#FF3366] mt-0.5 shrink-0" />
          <div className="font-mono text-xs text-[#FF3366]">
            <strong>{criticalCount} critical policy conflict{criticalCount > 1 ? 's' : ''} detected.</strong>{' '}
            Insecure DMZ bypass rules are present. Review and remediate immediately.
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 px-1 font-mono text-[10px] text-slate-600">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#10B981]" /> ALLOW</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#FF3366]" /> DENY</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#F59E0B]" /> REJECT</span>
        <span className="flex items-center gap-1 ml-auto"><GripVertical className="w-3 h-3" /> Drag to reorder</span>
      </div>

      {/* Rules List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rules.map(r => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {rules.map((rule, index) => (
              <SortableRuleRow
                key={rule.id}
                rule={rule}
                conflicts={conflicts}
                index={index}
                onDelete={() => deleteRule(rule.id)}
                onToggle={() => toggleRule(rule.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Rule Modal */}
      {showAddModal && <AddRuleModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
