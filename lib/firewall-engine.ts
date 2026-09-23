import { v4 as uuidv4 } from 'uuid';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Zone = 'WAN_TO_DMZ' | 'DMZ_TO_LAN' | 'WAN_TO_LAN' | 'ANY';
export type Protocol = 'TCP' | 'UDP' | 'ICMP' | 'ANY';
export type Action = 'ALLOW' | 'DENY' | 'REJECT';
export type ConnectionState = 'SYN_SENT' | 'ESTABLISHED' | 'FIN_WAIT' | 'CLOSED';
export type ConflictType = 'SHADOWING' | 'REDUNDANCY' | 'INSECURE_BYPASS';

export interface FirewallRule {
  id: string;
  priority: number;
  enabled: boolean;
  zone: Zone;
  srcIp: string;       // CIDR notation or 'any'
  destIp: string;
  srcPort: string;     // '80', '1024-2048', or 'any'
  destPort: string;
  protocol: Protocol;
  action: Action;
  description: string;
  hitCount: number;
  createdAt: number;
}

export interface PacketDescriptor {
  id: string;
  srcIp: string;
  destIp: string;
  srcPort: number;
  destPort: number;
  protocol: Protocol;
  tcpFlags?: string[];   // SYN, ACK, FIN, RST, PSH, URG
  isResponse?: boolean;
  timestamp: number;
}

export interface EvaluationResult {
  packet: PacketDescriptor;
  action: Action;
  matchedRule: FirewallRule | null;
  isStatefulHit: boolean;
  reason: string;
  zone: Zone;
  timestamp: number;
}

export interface ConnectionEntry {
  sessionId: string;
  clientIp: string;
  serverIp: string;
  clientPort: number;
  serverPort: number;
  protocol: Protocol;
  state: ConnectionState;
  timestamp: number;
  lastSeen: number;
}

export interface PolicyConflict {
  type: ConflictType;
  ruleId: string;
  conflictingRuleId?: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export type SyslogLevel = 'ALLOW' | 'DENY' | 'REJECT' | 'STATEFUL' | 'SYSTEM';

export interface SyslogEntry {
  id: string;
  timestamp: number;
  level: SyslogLevel;
  srcIp: string;
  destIp: string;
  protocol: string;
  srcPort: number;
  destPort: number;
  action: string;
  rule: string;
  message: string;
}

// ─── IP Matching Utilities ───────────────────────────────────────────────────

function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0;
}

function matchIp(packetIp: string, ruleIp: string): boolean {
  if (ruleIp === 'any' || ruleIp === '*' || ruleIp === '0.0.0.0/0') return true;
  if (ruleIp.includes('/')) {
    const [network, prefixStr] = ruleIp.split('/');
    const prefix = parseInt(prefixStr, 10);
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    return (ipToInt(packetIp) & mask) === (ipToInt(network) & mask);
  }
  return packetIp === ruleIp;
}

function matchPort(packetPort: number, rulePort: string): boolean {
  if (rulePort === 'any' || rulePort === '*' || rulePort === '0') return true;
  if (rulePort.includes('-')) {
    const [min, max] = rulePort.split('-').map(Number);
    return packetPort >= min && packetPort <= max;
  }
  return packetPort === parseInt(rulePort, 10);
}

function detectZone(srcIp: string, destIp: string): Zone {
  // Simplified zone detection based on IP ranges
  const dmzPrefixes = ['192.168.100.', '10.10.0.'];
  const lanPrefixes = ['192.168.1.', '10.0.0.', '172.16.'];
  
  const srcInDmz = dmzPrefixes.some(p => srcIp.startsWith(p));
  const srcInLan = lanPrefixes.some(p => srcIp.startsWith(p));
  const destInDmz = dmzPrefixes.some(p => destIp.startsWith(p));
  const destInLan = lanPrefixes.some(p => destIp.startsWith(p));

  if (!srcInDmz && !srcInLan && destInDmz) return 'WAN_TO_DMZ';
  if (!srcInDmz && !srcInLan && destInLan) return 'WAN_TO_LAN';
  if (srcInDmz && destInLan) return 'DMZ_TO_LAN';
  return 'ANY';
}

// ─── Firewall Engine ─────────────────────────────────────────────────────────

export class FirewallEngine {
  private rules: FirewallRule[] = [];
  private stateTable: Map<string, ConnectionEntry> = new Map();
  private readonly SESSION_TIMEOUT_MS = 3600000; // 1 hour

  constructor(initialRules: FirewallRule[] = []) {
    this.rules = [...initialRules].sort((a, b) => a.priority - b.priority);
  }

  setRules(rules: FirewallRule[]) {
    this.rules = [...rules]
      .filter(r => r.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  private getSessionKey(packet: PacketDescriptor): string {
    return `${packet.srcIp}:${packet.srcPort}->${packet.destIp}:${packet.destPort}:${packet.protocol}`;
  }

  private getReverseSessionKey(packet: PacketDescriptor): string {
    return `${packet.destIp}:${packet.destPort}->${packet.srcIp}:${packet.srcPort}:${packet.protocol}`;
  }

  private cleanStaleSessions() {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.stateTable.entries())) {
      if (now - entry.lastSeen > this.SESSION_TIMEOUT_MS) {
        this.stateTable.delete(key);
      }
    }
  }

  private checkStatefulTable(packet: PacketDescriptor): ConnectionEntry | null {
    this.cleanStaleSessions();
    // Check if this is a return packet for an established session
    const reverseKey = this.getReverseSessionKey(packet);
    const forwardKey = this.getSessionKey(packet);
    
    if (this.stateTable.has(reverseKey)) {
      const entry = this.stateTable.get(reverseKey)!;
      entry.lastSeen = Date.now();
      return entry;
    }
    if (this.stateTable.has(forwardKey)) {
      const entry = this.stateTable.get(forwardKey)!;
      entry.lastSeen = Date.now();
      return entry;
    }
    return null;
  }

  private addStateEntry(packet: PacketDescriptor) {
    const key = this.getSessionKey(packet);
    this.stateTable.set(key, {
      sessionId: uuidv4(),
      clientIp: packet.srcIp,
      serverIp: packet.destIp,
      clientPort: packet.srcPort,
      serverPort: packet.destPort,
      protocol: packet.protocol,
      state: 'ESTABLISHED',
      timestamp: Date.now(),
      lastSeen: Date.now(),
    });
  }

  private matchRule(rule: FirewallRule, packet: PacketDescriptor, zone: Zone): boolean {
    if (rule.zone !== 'ANY' && rule.zone !== zone) return false;
    if (rule.protocol !== 'ANY' && rule.protocol !== packet.protocol) return false;
    if (!matchIp(packet.srcIp, rule.srcIp)) return false;
    if (!matchIp(packet.destIp, rule.destIp)) return false;
    if (!matchPort(packet.srcPort, rule.srcPort)) return false;
    if (!matchPort(packet.destPort, rule.destPort)) return false;
    return true;
  }

  evaluate(packet: PacketDescriptor): EvaluationResult {
    const zone = detectZone(packet.srcIp, packet.destIp);

    // 1. Check stateful connection table first
    const statefulEntry = this.checkStatefulTable(packet);
    if (statefulEntry) {
      return {
        packet,
        action: 'ALLOW',
        matchedRule: null,
        isStatefulHit: true,
        reason: `Stateful session match — Session: ${statefulEntry.sessionId.slice(0, 8)}`,
        zone,
        timestamp: Date.now(),
      };
    }

    // 2. Top-to-bottom sequential rule evaluation
    for (const rule of this.rules) {
      if (this.matchRule(rule, packet, zone)) {
        // Increment hit counter (returned to store for update)
        rule.hitCount += 1;

        if (rule.action === 'ALLOW') {
          // Add to state table for bidirectional tracking
          if (packet.protocol === 'TCP' || packet.protocol === 'UDP') {
            this.addStateEntry(packet);
          }
        }

        return {
          packet,
          action: rule.action,
          matchedRule: rule,
          isStatefulHit: false,
          reason: `Rule #${rule.priority} matched — "${rule.description}"`,
          zone,
          timestamp: Date.now(),
        };
      }
    }

    // 3. Implicit Default Deny
    return {
      packet,
      action: 'DENY',
      matchedRule: null,
      isStatefulHit: false,
      reason: 'IMPLICIT DENY — No matching rule. Default deny-all policy applied.',
      zone,
      timestamp: Date.now(),
    };
  }

  getStateTable(): ConnectionEntry[] {
    return Array.from(this.stateTable.values());
  }

  clearStateTable() {
    this.stateTable.clear();
  }
}

// ─── Policy Conflict Auditor ─────────────────────────────────────────────────

export function auditPolicies(rules: FirewallRule[]): PolicyConflict[] {
  const conflicts: PolicyConflict[] = [];
  const sorted = [...rules].filter(r => r.enabled).sort((a, b) => a.priority - b.priority);

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const upper = sorted[i];
      const lower = sorted[j];

      // Check REDUNDANCY: identical parameters
      const isRedundant =
        upper.zone === lower.zone &&
        upper.srcIp === lower.srcIp &&
        upper.destIp === lower.destIp &&
        upper.srcPort === lower.srcPort &&
        upper.destPort === lower.destPort &&
        upper.protocol === lower.protocol &&
        upper.action === lower.action;

      if (isRedundant) {
        conflicts.push({
          type: 'REDUNDANCY',
          ruleId: lower.id,
          conflictingRuleId: upper.id,
          description: `Rule #${lower.priority} ("${lower.description}") is redundant — identical to Rule #${upper.priority} which has higher priority.`,
          severity: 'LOW',
        });
        continue;
      }

      // Check SHADOWING: upper rule matches a superset of lower rule
      const upperCoversZone = upper.zone === 'ANY' || upper.zone === lower.zone;
      const upperCoversSrcIp = upper.srcIp === 'any' || upper.srcIp === lower.srcIp;
      const upperCoversDestIp = upper.destIp === 'any' || upper.destIp === lower.destIp;
      const upperCoversSrcPort = upper.srcPort === 'any' || upper.srcPort === lower.srcPort;
      const upperCoversDestPort = upper.destPort === 'any' || upper.destPort === lower.destPort;
      const upperCoversProtocol = upper.protocol === 'ANY' || upper.protocol === lower.protocol;

      if (
        upperCoversZone &&
        upperCoversSrcIp &&
        upperCoversDestIp &&
        upperCoversSrcPort &&
        upperCoversDestPort &&
        upperCoversProtocol &&
        upper.action !== lower.action
      ) {
        conflicts.push({
          type: 'SHADOWING',
          ruleId: lower.id,
          conflictingRuleId: upper.id,
          description: `Rule #${lower.priority} ("${lower.description}") is SHADOWED by Rule #${upper.priority} — the broader rule above will always intercept first, making this rule unreachable.`,
          severity: 'HIGH',
        });
      }
    }

    // Check INSECURE DMZ BYPASS: direct WAN → LAN traffic allowed
    const rule = sorted[i];
    if (rule.zone === 'WAN_TO_LAN' && rule.action === 'ALLOW') {
      const bypasesAllLan =
        rule.destIp === 'any' ||
        rule.destIp.startsWith('192.168.1.') ||
        rule.destIp.startsWith('10.0.0.') ||
        rule.destIp.startsWith('172.16.');

      if (bypasesAllLan) {
        conflicts.push({
          type: 'INSECURE_BYPASS',
          ruleId: rule.id,
          description: `Rule #${rule.priority} ("${rule.description}") allows direct WAN→LAN traffic, BYPASSING the DMZ security layer. This violates Defense-in-Depth architecture.`,
          severity: 'CRITICAL',
        });
      }
    }
  }

  return conflicts;
}

// ─── Syslog Formatter ────────────────────────────────────────────────────────

export function formatSyslogEntry(result: EvaluationResult): SyslogEntry {
  const { packet, action, matchedRule, isStatefulHit, reason } = result;
  const date = new Date(result.timestamp);

  let level: SyslogLevel;
  if (isStatefulHit) level = 'STATEFUL';
  else if (action === 'ALLOW') level = 'ALLOW';
  else if (action === 'DENY') level = 'DENY';
  else level = 'REJECT';

  const ruleRef = isStatefulHit
    ? 'STATEFUL-TABLE'
    : matchedRule
    ? `RULE-${matchedRule.priority}`
    : 'IMPLICIT-DENY';

  return {
    id: uuidv4(),
    timestamp: result.timestamp,
    level,
    srcIp: packet.srcIp,
    destIp: packet.destIp,
    protocol: packet.protocol,
    srcPort: packet.srcPort,
    destPort: packet.destPort,
    action,
    rule: ruleRef,
    message: `[${date.toISOString()}] ${action} | ${packet.protocol} ${packet.srcIp}:${packet.srcPort} → ${packet.destIp}:${packet.destPort} | ${reason} | Zone: ${result.zone}`,
  };
}
