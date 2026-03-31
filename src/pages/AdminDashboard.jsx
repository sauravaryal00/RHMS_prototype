import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  History,
  TrendingUp,
  Cpu,
  Zap,
  Globe
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import VitalsChart from '../components/VitalsChart';
import { useRealtimeVitals } from '../hooks/useRealtimeVitals';
import { useConsentTokens } from '../hooks/useConsentTokens';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useAnomalyAlerts } from '../hooks/useAnomalyAlerts';
import { useSystemMetrics } from '../hooks/useSystemMetrics';
import { supabase } from '../utils/supabaseClient';

const AdminDashboard = () => {
  const { vitals, history, connectionStatus } = useRealtimeVitals('patient-42');
  const { tokens } = useConsentTokens();
  const { logs } = useAuditLogs();
  const { alerts, triggerAnomaly } = useAnomalyAlerts();
  const { avgLatency, securityScore, blockedAttempts } = useSystemMetrics();
  const [isSimulating, setIsSimulating] = useState(false);

  // Sensor Simulation Logic
  useEffect(() => {
    let interval;
    if (isSimulating && supabase) {
      interval = setInterval(async () => {
        const payload = {
          patient_id: 'patient-42',
          device_id: 'dev-001',
          hr: Math.round(72 + Math.random() * 15),
          bp_sys: Math.round(115 + Math.random() * 15),
          bp_dia: Math.round(75 + Math.random() * 10),
          spo2: parseFloat((96 + Math.random() * 3.5).toFixed(1)),
          timestamp: new Date().toISOString()
        };
        await supabase.from('vitals').insert([payload]);
      }, 5000); // Push every 5s
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const stats = [
    { label: 'Security Score', value: `${securityScore}%`, icon: ShieldCheck, color: 'text-success' },
    { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Activity, color: 'text-primary' },
    { label: 'Active Tokens', value: tokens?.filter(t => !t.revoked).length || 0, icon: Zap, color: 'text-warning' },
    { label: 'Blocked Attempts', value: blockedAttempts || 0, icon: AlertTriangle, color: 'text-danger' },
  ];

  const handleTriggerAnomaly = async () => {
    await triggerAnomaly(
      'RULE-03',
      'HIGH',
      'CRITICAL: Multiple access attempts detected on revoked token region.',
      'patient-42',
      'attacker_node_01'
    );
  };

  return (
    <div className="flex bg-background min-h-screen text-text-primary">
      <Sidebar role="admin" />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-outfit">System Overview</h1>
            <p className="text-muted">Master's Thesis Prototype | Saurav Aryal</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={async () => {
                const { error: err1 } = await supabase.from('access_requests').delete().neq('status', 'resolved_fake');
                const { error: err2 } = await supabase.from('consent_tokens').delete().neq('token_id', 'resolved_fake');
                if (!err1 && !err2) alert('SYSTEM RESET: All tokens and requests cleared for fresh demo!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-muted rounded-xl font-bold text-xs hover:bg-white/10 transition-all font-mono"
            >
              <History size={14} /> [RESET_SYSTEM]
            </button>
            <button 
              onClick={handleTriggerAnomaly}
              className="flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/20 text-danger rounded-xl font-bold text-xs hover:bg-danger hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            >
              <ShieldAlert size={14} /> TRIGGER ANOMALY
            </button>
            <button 
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all ${
                isSimulating 
                ? 'bg-success/20 border-success/30 text-success' 
                : 'bg-white/5 border-white/10 text-muted hover:border-primary/30'
              }`}
            >
              <Zap size={14} className={isSimulating ? 'animate-pulse' : ''} />
              {isSimulating ? 'SIMULATION ACTIVE' : 'START SENSOR SIM'}
            </button>
            <div className="flex items-center gap-4 px-4 py-2 bg-surface border border-white/5 rounded-xl">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted font-mono uppercase tracking-widest">MQTT Broker</span>
                <span className="text-xs font-mono text-success flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  {connectionStatus}
                </span>
              </div>
              <div className="w-px h-8 bg-white/10 mx-2" />
              <Globe className="text-primary w-5 h-5" />
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="glass p-6 rounded-2xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-2">
                <stat.icon className={`w-8 h-8 ${stat.color} opacity-80 group-hover:scale-110 transition-transform`} />
                <TrendingUp className="w-4 h-4 text-white/10" />
              </div>
              <div className="text-2xl font-bold font-mono">{stat.value}</div>
              <div className="text-xs text-muted font-medium uppercase tracking-wider">{stat.label}</div>
              <div className={`absolute bottom-0 left-0 h-1 transition-all group-hover:w-full ${stat.color.replace('text-', 'bg-')} opacity-20 w-0`} />
            </motion.div>
          ))}
        </div>

        {/* Real-Time Vitals Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <VitalsChart 
            data={history} 
            dataKey="hr" 
            color="#00d4ff" 
            title="Heart Rate" 
            unit="BPM" 
            min={60} 
            max={120} 
          />
          <VitalsChart 
            data={history} 
            dataKey="bp_sys" 
            color="#10b981" 
            title="Blood Pressure" 
            unit="mmHg" 
            min={100} 
            max={140} 
          />
          <VitalsChart 
            data={history} 
            dataKey="spo2" 
            color="#ef4444" 
            title="SpO2 Level" 
            unit="%" 
            min={90} 
            max={100} 
          />
        </div>

        {/* Active Consent Tokens & System Diagram */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold font-outfit text-lg">Active Consent Tokens</h3>
              <button className="text-xs text-primary hover:underline">View All Audit Logs</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-muted uppercase tracking-widest border-b border-white/5">
                    <th className="pb-4 font-medium">Patient</th>
                    <th className="pb-4 font-medium">Clinician</th>
                    <th className="pb-4 font-medium">Purpose</th>
                    <th className="pb-4 font-medium">Expires In</th>
                    <th className="pb-4 font-medium">Status</th>
                  </tr>
                </thead>
                 <tbody className="text-sm font-mono">
                  {(tokens || []).filter(t => !t.revoked).map((token) => (
                    <tr key={token.token_id} className="border-b border-white/5 group hover:bg-white/5">
                      <td className="py-4">
                        <div className="text-xs font-semibold">{token.patient_id}</div>
                      </td>
                      <td className="py-4">
                        <div className="text-xs text-text-primary capitalize">{token.clinician_id}</div>
                        <div className="text-[10px] text-muted italic">{token.clinician_role}</div>
                      </td>
                      <td className="py-4 font-sans text-xs">
                        {token?.purpose?.replace('_', ' ') || 'General Access'}
                      </td>
                      <td className="py-4">
                        <span className="text-xs text-warning animate-pulse">00:{Math.floor(Math.random() * 59).toString().padStart(2, '0')}</span>
                      </td>
                      <td className="py-4 text-[10px]">
                        <span className="px-2 py-1 rounded bg-success/10 text-success border border-success/20">ACTIVE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold font-outfit text-lg mb-6 text-center">System Architecture Live Flow</h3>
            <div className="relative h-48 border border-white/5 rounded-xl bg-white/5 flex items-center justify-between p-8 overflow-hidden">
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-12 h-12 rounded-lg bg-surface border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                  <Cpu size={20} />
                </div>
                <span className="text-[10px] text-muted font-mono">DEVICE</span>
              </div>
              
              <div className="flex-1 relative flex items-center justify-between px-4">
                <div className="h-px bg-white/10 w-full relative">
                  <div className="data-dot" style={{ top: '-1.5px', left: '10%' }} />
                  <div className="data-dot" style={{ top: '-1.5px', left: '40%', animationDelay: '0.5s' }} />
                  <div className="data-dot" style={{ top: '-1.5px', left: '70%', animationDelay: '1s' }} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-12 h-12 rounded-lg bg-surface border border-success/40 flex items-center justify-center text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-[10px] text-muted font-mono">BROKER</span>
              </div>

              <div className="flex-1 relative flex items-center justify-between px-4">
                <div className="h-px bg-white/10 w-full relative">
                  <div className="data-dot" style={{ top: '-1.5px', left: '20%', animationDelay: '0.2s' }} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-12 h-12 rounded-lg bg-surface border border-warning/40 flex items-center justify-center text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Activity size={20} />
                </div>
                <span className="text-[10px] text-muted font-mono">GATEWAY</span>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-muted text-center font-mono italic">Real-time hash-chained verification active</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
