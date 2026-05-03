import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, AlertTriangle, Zap, Globe, Cpu, History } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import VitalsChart from '../components/VitalsChart';
import { useRealtimeVitals } from '../hooks/useRealtimeVitals';
import { useConsentTokens } from '../hooks/useConsentTokens';
import { useSystemMetrics } from '../hooks/useSystemMetrics';

const AdminDashboard = () => {
  const { history, connectionStatus } = useRealtimeVitals('patient-42');
  const { tokens } = useConsentTokens();
  const { avgLatency, securityScore, blockedAttempts } = useSystemMetrics();

  const stats = [
    { label: 'Security Score', value: `${securityScore}%`, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Tokens', value: tokens?.filter(t => !t.revoked).length || 0, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Blocked Attempts', value: blockedAttempts || 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans">
      <Sidebar role="admin" />
      
      <main className="flex-1 ml-64 p-8 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black font-outfit text-slate-900">System Overview</h1>
            <p className="text-slate-500 font-medium mt-1">Master's Thesis Prototype | System Metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">MQTT Broker</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {connectionStatus}
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
              <div className="text-3xl font-black font-mono text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* System Architecture Live Flow */}
        <div className="mb-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-800 text-lg mb-8 text-center uppercase tracking-widest">Zero-Trust Architecture Flow</h3>
            <div className="relative h-32 border border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-between p-8 overflow-hidden">
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-14 h-14 rounded-2xl bg-white border border-blue-200 flex items-center justify-center text-blue-500 shadow-sm">
                  <Cpu size={24} />
                </div>
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Patient Device</span>
              </div>
              
              <div className="flex-1 relative flex items-center justify-between px-4">
                <div className="h-0.5 bg-slate-200 w-full relative">
                  <div className="w-2 h-2 rounded-full bg-blue-500 absolute -top-[3px] animate-ping" style={{ left: '20%' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-500 absolute -top-[3px] animate-ping" style={{ left: '50%', animationDelay: '0.5s' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-500 absolute -top-[3px] animate-ping" style={{ left: '80%', animationDelay: '1s' }} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-500 shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Secure Broker</span>
              </div>

              <div className="flex-1 relative flex items-center justify-between px-4">
                <div className="h-0.5 bg-slate-200 w-full relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-[3px] animate-ping" style={{ left: '50%', animationDelay: '0.2s' }} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 z-10">
                <div className="w-14 h-14 rounded-2xl bg-white border border-amber-200 flex items-center justify-center text-amber-500 shadow-sm">
                  <Activity size={24} />
                </div>
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Policy Gateway</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-400 font-bold text-center uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              End-to-End Encryption & Hash-Chained Verification Active
            </p>
          </div>
        </div>

        {/* Real-Time Vitals Feed (Light Theme Version) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
            <Activity className="text-blue-500" /> Live Vitals Stream
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <VitalsChart 
              data={history} 
              dataKey="hr" 
              color="#3b82f6" 
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
              color="#f43f5e" 
              title="SpO2 Level" 
              unit="%" 
              min={90} 
              max={100} 
            />
            <VitalsChart 
              data={history} 
              dataKey="temp" 
              color="#f59e0b" 
              title="Body Temperature" 
              unit="°F" 
              min={96} 
              max={104} 
            />
            <VitalsChart 
              data={history} 
              dataKey="resp" 
              color="#8b5cf6" 
              title="Respiratory Rate" 
              unit="br/m" 
              min={12} 
              max={25} 
            />
            <VitalsChart 
              data={history} 
              dataKey="glucose" 
              color="#ec4899" 
              title="Blood Glucose" 
              unit="mg/dL" 
              min={70} 
              max={150} 
            />
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
