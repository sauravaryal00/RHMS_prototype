import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, AlertTriangle, Zap, Globe, Cpu, History, Lock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import VitalsChart from '../components/VitalsChart';
import { useRealtimeVitals } from '../hooks/useRealtimeVitals';
import { useConsentTokens } from '../hooks/useConsentTokens';
import { useSystemMetrics } from '../hooks/useSystemMetrics';

const AdminDashboard = () => {
  const { history = [], connectionStatus = "Disconnected" } = useRealtimeVitals('patient-42');
  const { tokens = [] } = useConsentTokens();
  const { avgLatency = "0", securityScore = "0", blockedAttempts = 0 } = useSystemMetrics();

  const stats = [
    { label: 'Security Score', value: `${securityScore || 0}%`, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Avg Latency', value: `${avgLatency || 0}ms`, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Tokens', value: tokens?.filter(t => !t.revoked).length || 0, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Blocked Attempts', value: blockedAttempts || 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans">
      <Sidebar role="admin" />
      
      <main className="flex-1 ml-64 p-8 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black font-outfit text-slate-900 uppercase tracking-tighter">System Overview</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">RHMS Security Node | Master's Thesis</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gateway Status</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200 mx-2" />
              <Globe className="text-blue-500 w-5 h-5" />
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
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                </div>
              </div>
              <div className="text-3xl font-black font-mono text-slate-800">{stat.value || '0'}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* System Architecture Live Flow */}
        <div className="mb-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-800 text-xs mb-8 text-center uppercase tracking-[0.3em] text-slate-400">Zero-Trust Architecture Flow</h3>
            <div className="relative h-32 border border-slate-50 rounded-2xl bg-slate-50/50 flex items-center justify-between p-8 overflow-hidden">
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                  <Cpu size={24} />
                </div>
                <span className="text-[8px] text-slate-400 font-bold tracking-widest uppercase">Patient Node</span>
              </div>
              
              <div className="flex-1 relative flex items-center justify-between px-4">
                <div className="h-0.5 bg-slate-100 w-full" />
              </div>

              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-[8px] text-slate-400 font-bold tracking-widest uppercase">Encryption Layer</span>
              </div>

              <div className="flex-1 relative flex items-center justify-between px-4">
                <div className="h-0.5 bg-slate-100 w-full" />
              </div>

              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-14 h-14 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-blue-500 shadow-sm">
                  <Activity size={24} />
                </div>
                <span className="text-[8px] text-slate-400 font-bold tracking-widest uppercase">Policy Gateway</span>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Mode Switcher (Live Thesis Control) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.3em] text-slate-400">Security Posture Control</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { id: 'CONSENT_MODE', name: 'Consent Token', icon: ShieldCheck, desc: 'Proposed Protocol' },
              { id: 'PASSWORD_OTP_MODE', name: 'OTP Mode', icon: Lock, desc: 'Baseline 1' },
              { id: 'LOGGING_ONLY_MODE', name: 'Logging Only', icon: History, desc: 'Audit Active' },
              { id: 'ZERO_TRUST_MODE', name: 'Zero Trust', icon: Globe, desc: 'Strict Filter' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={async () => {
                  try {
                    const resp = await fetch('http://127.0.0.1:8000/system/policy', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ mode: mode.id })
                    });
                    if (resp.ok) alert(`Policy Switched to: ${mode.name}`);
                    else alert('Backend Error');
                  } catch (err) {
                    alert('Backend Offline: Please run rhms_server.py locally.');
                  }
                }}
                className="flex flex-col items-center p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <mode.icon size={18} className="text-blue-500" />
                </div>
                <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{mode.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Real-Time Vitals Feed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
            <Activity className="text-blue-500" /> Live Data Stream
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(history) && history.length > 0 ? (
              <>
                <VitalsChart data={history} dataKey="hr" color="#3b82f6" title="Heart Rate" unit="BPM" min={60} max={120} />
                <VitalsChart data={history} dataKey="bp_sys" color="#10b981" title="Blood Pressure" unit="mmHg" min={100} max={140} />
                <VitalsChart data={history} dataKey="spo2" color="#f43f5e" title="SpO2 Level" unit="%" min={90} max={100} />
              </>
            ) : (
              <div className="col-span-full p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] border-2 border-dashed border-slate-100 rounded-3xl">
                Waiting for MQTT Data Stream...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
