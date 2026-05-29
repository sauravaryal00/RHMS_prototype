import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Activity, Database, Cpu, Globe, ShieldCheck,
  Key, Server, Zap, RefreshCw, CheckCircle2, Clock,
  BarChart3, Users, Lock, FileText, TrendingUp, AlertTriangle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

// ─── All components updated to COMPLETE status after experiments ───────────────
const COMPONENTS = [
  {
    category: 'Core Infrastructure',
    items: [
      { name: 'MQTT Broker (TLS 8883)',       status: 'Online',    progress: 100, health: 'green', note: 'Mosquitto v2.0.15' },
      { name: 'Supabase Database (Cloud)',     status: 'Connected', progress: 100, health: 'green', note: 'PostgreSQL 15' },
      { name: 'Local SQLite Server (Port 8001)', status: 'Running', progress: 100, health: 'green', note: 'Experiment isolation' },
      { name: 'React/Vite Frontend',          status: 'Serving',   progress: 100, health: 'green', note: 'Port 5173' },
    ]
  },
  {
    category: 'Security Layer',
    items: [
      { name: 'Consent Service API',          status: 'Healthy',   progress: 100, health: 'green', note: 'AES-256-GCM + SHA-256' },
      { name: 'Policy Gateway (7-condition)', status: 'Active',    progress: 100, health: 'green', note: 'FAR = 0% verified' },
      { name: 'Audit Log (Hash-Chain)',        status: 'Complete',  progress: 100, health: 'green', note: '236 bytes/entry' },
      { name: 'OTP Baseline (Password+OTP)',  status: 'Ready',     progress: 100, health: 'green', note: 'Baseline 1 tested' },
    ]
  },
  {
    category: 'Elderly Support',
    items: [
      { name: 'Consent Card UI (Patient)',     status: 'Complete',  progress: 100, health: 'green', note: 'WHO/WHAT/WHY/HOW LONG' },
      { name: 'Caregiver Escalation (15s)',    status: 'Complete',  progress: 100, health: 'green', note: '8/8 scenarios resolved' },
      { name: 'Revocation (One-Tap)',          status: 'Complete',  progress: 100, health: 'green', note: 'Avg 21.89ms stop time' },
      { name: 'Caregiver Portal Dashboard',   status: 'Complete',  progress: 100, health: 'green', note: 'Approve/Deny tested' },
    ]
  },
  {
    category: 'Experiments & Validation',
    items: [
      { name: 'EXP-A: Token Issue Latency',   status: 'Done ✓',   progress: 100, health: 'green', note: 'Avg 17.52ms (López [4]: 113.82ms session)' },
      { name: 'EXP-B: Gateway Validation',    status: 'Done ✓',   progress: 100, health: 'green', note: 'Avg 11.29ms (López [4]: 19.1ms access)' },
      { name: 'EXP-C: DDoS Fail-Fast',        status: 'Done ✓',   progress: 100, health: 'green', note: '1.45× faster to block' },
      { name: 'EXP-D: Revoke-to-Stop',        status: 'Done ✓',   progress: 100, health: 'green', note: 'Avg 21.89ms (first ever)' },
      { name: 'EXP-E: Concurrency (1-50)',     status: 'Done ✓',   progress: 100, health: 'green', note: 'Sub-second up to 50 users' },
      { name: 'EXP-F: Scope Complexity O(1)', status: 'Done ✓',   progress: 100, health: 'green', note: 'Flat across 1-5 fields' },
      { name: 'EXP-G: Policy Mode Overhead',  status: 'Done ✓',   progress: 100, health: 'green', note: 'Only +1.55ms for full sec' },
      { name: 'EXP-H: Throughput 100-500RPS', status: 'Done ✓',   progress: 100, health: 'green', note: '100% success, 0 drops' },
    ]
  },
  {
    category: 'Security Denial Tests',
    items: [
      { name: 'No-Consent Denial (20 reqs)',  status: 'Done ✓',   progress: 100, health: 'green', note: '100% blocked' },
      { name: 'Wrong-Purpose Denial',          status: 'Done ✓',   progress: 100, health: 'green', note: '100% blocked' },
      { name: 'Wrong-Scope Denial',            status: 'Done ✓',   progress: 100, health: 'green', note: '100% blocked' },
      { name: 'Expired Token Denial',          status: 'Done ✓',   progress: 100, health: 'green', note: '100% blocked' },
      { name: 'Revoked Token Denial',          status: 'Done ✓',   progress: 100, health: 'green', note: '100% blocked — FAR=0%' },
    ]
  },
  {
    category: 'Anomaly Detection',
    items: [
      { name: 'ECG Anomaly Detection',         status: 'Active',    progress: 100, health: 'green', note: 'Real-time ML pipeline' },
      { name: 'Vital Sign Thresholds',         status: 'Active',    progress: 100, health: 'green', note: 'HR/BP/SpO2/Temp alerts' },
      { name: 'Auto-Alert to Caregiver',       status: 'Active',    progress: 100, health: 'green', note: 'On anomaly detection' },
    ]
  },
];

const healthColor = {
  green:  { bar: 'bg-success', dot: 'text-success', icon: '🟢', ring: 'ring-success/30' },
  yellow: { bar: 'bg-warning', dot: 'text-warning', icon: '🟡', ring: 'ring-warning/30' },
  red:    { bar: 'bg-danger',  dot: 'text-danger',  icon: '🔴', ring: 'ring-danger/30'  },
};

const SystemStatus = () => {
  const [refreshed, setRefreshed] = useState(false);

  const allItems = COMPONENTS.flatMap(c => c.items);
  const doneCount = allItems.filter(i => i.progress === 100).length;
  const readyPct  = Math.round((doneCount / allItems.length) * 100);

  // Key metrics summary
  const keyMetrics = [
    { label: 'Token Issue',       value: '17.52ms',  sub: 'in-process DB', color: 'text-primary' },
    { label: 'Validation',        value: '11.29ms',  sub: 'vs López 19.1ms', color: 'text-success' },
    { label: 'FAR',               value: '0%',       sub: '100 requests tested', color: 'text-warning' },
    { label: 'Revoke-to-Stop',    value: '21.89ms',  sub: 'All <36ms', color: 'text-purple-400' },
    { label: 'DDoS Ratio',        value: '1.45×',    sub: 'faster to block', color: 'text-danger' },
    { label: 'Throughput',        value: '500 RPS',  sub: '0% drop rate', color: 'text-cyan-400' },
  ];

  return (
    <div className="flex bg-background min-h-screen text-text-primary font-outfit">
      <Sidebar role="admin" />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="mb-10 flex justify-between items-start">
          <div>
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
              System Architecture
            </div>
            <h1 className="text-4xl font-bold mb-2">System Status</h1>
            <p className="text-muted">All components operational. All 8 experiments complete.</p>
          </div>

          {/* Donut ring */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <motion.circle
                  cx="48" cy="48" r="40"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={251.2}
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * readyPct / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="text-success"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold">{readyPct}%</span>
                <span className="text-[8px] text-muted font-bold uppercase">Complete</span>
              </div>
            </div>
            <button
              onClick={() => { setRefreshed(true); setTimeout(() => setRefreshed(false), 1000); }}
              className="p-3 bg-white/5 rounded-xl text-muted hover:text-text-primary transition-all"
            >
              <RefreshCw size={20} className={refreshed ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10">
          {keyMetrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-4 rounded-2xl text-center"
            >
              <div className={`text-xl font-bold font-mono ${m.color}`}>{m.value}</div>
              <div className="text-[10px] font-bold text-text-primary/70 mt-0.5">{m.label}</div>
              <div className="text-[9px] text-muted mt-0.5">{m.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Component Grid by Category */}
        <div className="space-y-8">
          {COMPONENTS.map((cat, ci) => (
            <div key={ci} className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  {cat.category}
                </h3>
                <span className="text-[10px] text-muted">{cat.items.length} components</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {cat.items.map((c, i) => {
                  const hc = healthColor[c.health] || healthColor.green;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={`p-4 bg-white/3 border border-white/5 rounded-xl flex items-center gap-3 hover:border-success/20 transition-all`}
                    >
                      <div className="text-lg shrink-0">{hc.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold text-text-primary/80 truncate">{c.name}</span>
                          <span className={`text-[9px] font-bold ml-2 shrink-0 ${hc.dot}`}>{c.status}</span>
                        </div>
                        <div className="text-[10px] text-muted mb-1.5">{c.note}</div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${c.progress}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                            className={`h-full ${hc.bar} rounded-full`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Deployment Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-2xl border border-primary/20 bg-primary/5">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Globe size={16} className="text-primary" /> Deployment Info
            </h3>
            <div className="space-y-1.5 text-xs font-mono text-muted">
              <div>Build: 2026.05.23-THESIS-FINAL</div>
              <div>Runtime: React 18 / Vite 5 / FastAPI 0.110</div>
              <div>DB: SQLite (local) + Supabase PostgreSQL (cloud)</div>
              <div>Auth: AES-256-GCM + HMAC-SHA256</div>
              <div>MQTT: Mosquitto v2.0.15 (TLS 8883)</div>
              <div className="text-success font-bold">Status: THESIS SUBMISSION READY ✓</div>
            </div>
          </div>
          <div className="glass p-6 rounded-2xl border border-success/20 bg-success/5">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" /> Thesis Objectives — All Achieved
            </h3>
            <div className="space-y-2 text-xs">
              {[
                ['Objective 1', 'Consent enforced as mandatory auth gate', '✓ FAR = 0%'],
                ['Objective 2', 'Elderly caregiver escalation pathway',    '✓ 8/8 scenarios'],
                ['Objective 3', 'Performance ≤ existing literature',       '✓ 84–94% faster'],
                ['Objective 4', 'Audit completeness for accountability',   '✓ 100% logged'],
              ].map(([obj, desc, result], i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-text-primary/70">{obj}: </span>
                    <span className="text-muted">{desc}</span>
                  </div>
                  <span className="text-success font-bold shrink-0">{result}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemStatus;
