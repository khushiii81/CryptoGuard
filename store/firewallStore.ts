import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  FirewallRule,
  PacketDescriptor,
  EvaluationResult,
  SyslogEntry,
  ConnectionEntry,
  PolicyConflict,
  FirewallEngine,
  auditPolicies,
  formatSyslogEntry,
  Protocol,
} from '@/lib/firewall-engine';
import { defaultRules } from '@/lib/default-rules';

interface FirewallStore {
  // Rules
  rules: FirewallRule[];
  setRules: (rules: FirewallRule[]) => void;
  addRule: (rule: Omit<FirewallRule, 'id' | 'hitCount' | 'createdAt'>) => void;
  updateRule: (id: string, updates: Partial<FirewallRule>) => void;
  deleteRule: (id: string) => void;
  reorderRules: (fromIndex: number, toIndex: number) => void;
  toggleRule: (id: string) => void;
  resetRules: () => void;

  // Engine & Evaluation
  engine: FirewallEngine;
  lastResult: EvaluationResult | null;
  injectPacket: (packet: Omit<PacketDescriptor, 'id' | 'timestamp'>) => EvaluationResult;

  // State Table
  stateTable: ConnectionEntry[];
  refreshStateTable: () => void;
  clearStateTable: () => void;

  // Syslog
  syslog: SyslogEntry[];
  clearSyslog: () => void;
  addSystemLog: (message: string) => void;

  // Conflict Audit
  conflicts: PolicyConflict[];
  runAudit: () => void;

  // UI state
  isSimulating: boolean;
  activePacketId: string | null;
}

export const useFirewallStore = create<FirewallStore>((set, get) => {
  const engine = new FirewallEngine(defaultRules);

  return {
    rules: defaultRules,
    engine,
    lastResult: null,
    stateTable: [],
    syslog: [
      {
        id: uuidv4(),
        timestamp: Date.now(),
        level: 'SYSTEM',
        srcIp: '0.0.0.0',
        destIp: '0.0.0.0',
        protocol: 'SYSTEM',
        srcPort: 0,
        destPort: 0,
        action: 'INIT',
        rule: 'SYSTEM',
        message: `[${new Date().toISOString()}] SYSTEM INIT — CryptoGuard Firewall Simulator v2.4 ONLINE. ${defaultRules.length} rules loaded. Defense posture: ARMED.`,
      },
    ],
    conflicts: [],
    isSimulating: false,
    activePacketId: null,

    setRules: (rules) => {
      get().engine.setRules(rules);
      set({ rules });
    },

    addRule: (ruleData) => {
      const newRule: FirewallRule = {
        ...ruleData,
        id: uuidv4(),
        hitCount: 0,
        createdAt: Date.now(),
      };
      const rules = [...get().rules, newRule].sort((a, b) => a.priority - b.priority);
      get().engine.setRules(rules);
      set({ rules });
    },

    updateRule: (id, updates) => {
      const rules = get().rules.map(r => (r.id === id ? { ...r, ...updates } : r));
      get().engine.setRules(rules);
      set({ rules });
    },

    deleteRule: (id) => {
      const rules = get().rules.filter(r => r.id !== id);
      get().engine.setRules(rules);
      set({ rules });
    },

    reorderRules: (fromIndex, toIndex) => {
      const rules = [...get().rules];
      const [moved] = rules.splice(fromIndex, 1);
      rules.splice(toIndex, 0, moved);
      // Re-assign priorities based on new order
      const reordered = rules.map((r, i) => ({ ...r, priority: (i + 1) * 10 }));
      get().engine.setRules(reordered);
      set({ rules: reordered });
    },

    toggleRule: (id) => {
      const rules = get().rules.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      get().engine.setRules(rules);
      set({ rules });
    },

    resetRules: () => {
      const fresh = defaultRules.map(r => ({ ...r, id: uuidv4(), hitCount: 0, createdAt: Date.now() }));
      get().engine.setRules(fresh);
      set({ rules: fresh });
    },

    injectPacket: (packetData) => {
      const packet: PacketDescriptor = {
        ...packetData,
        id: uuidv4(),
        timestamp: Date.now(),
      };

      set({ isSimulating: true, activePacketId: packet.id });

      const result = get().engine.evaluate(packet);
      const syslogEntry = formatSyslogEntry(result);

      // Update hit count on matched rule
      if (result.matchedRule) {
        const rules = get().rules.map(r =>
          r.id === result.matchedRule!.id ? { ...r, hitCount: r.hitCount + 1 } : r
        );
        set({ rules });
      }

      set(state => ({
        lastResult: result,
        syslog: [syslogEntry, ...state.syslog].slice(0, 500),
        isSimulating: false,
        activePacketId: null,
        stateTable: get().engine.getStateTable(),
      }));

      return result;
    },

    refreshStateTable: () => {
      set({ stateTable: get().engine.getStateTable() });
    },

    clearStateTable: () => {
      get().engine.clearStateTable();
      set({ stateTable: [] });
    },

    clearSyslog: () => {
      set({ syslog: [] });
    },

    addSystemLog: (message) => {
      const entry: SyslogEntry = {
        id: uuidv4(),
        timestamp: Date.now(),
        level: 'SYSTEM',
        srcIp: '0.0.0.0',
        destIp: '0.0.0.0',
        protocol: 'SYSTEM',
        srcPort: 0,
        destPort: 0,
        action: 'INFO',
        rule: 'SYSTEM',
        message: `[${new Date().toISOString()}] ${message}`,
      };
      set(state => ({ syslog: [entry, ...state.syslog] }));
    },

    runAudit: () => {
      const conflicts = auditPolicies(get().rules);
      set({ conflicts });
    },
  };
});
