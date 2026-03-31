import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Activity, 
  Database, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Key, 
  Server,
  Zap,
  RefreshCw,
  LayoutGrid,
  FileCode
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const SystemStatus = () => {
  const components = [
    { name: 'MQTT Broker (TLS 8883)', status: 'Online', progress: 100, health: '🟢' },
    { name: 'Device Simulator', status: 'Running', progress: 100, health: '🟢' },
    { name: 'Supabase Database', status: 'Connected', progress: 100, health: '🟢' },
    { name: 'Consent Service API', status: 'Healthy', progress: 100, health: '🟢' },
    { name: 'Policy Gateway (7-step)', status: 'Active', progress: 100, health: '🟢' },
    { name: 'Audit Log Hash-Chain', status: 'Partial', progress: 40, health: '🟡' },
    { name: 'Consent Card UI', status: 'Online', progress: 100, health: '🟢' },
    { name: 'Care-Pair Co-Approval', status: 'Building', progress: 50, health: '🟡' },
    { name: 'Anomaly Detection System', status: 'Testing', progress: 30, health: '🟡' },
    { name: 'Baseline 1: Password+OTP', status: 'Ready', progress: 100, health: '🟢' },
    { name: 'Baseline 2: RBAC+Logging', status: 'Partial', progress: 45, health: '🟡' },
    { name: 'Baseline 3: Zero Trust', status: 'Planned', progress: 0, health: '🔴' },
    { name: 'Load Testing (Locust)', status: 'Active', progress: 20, health: '🟡' },
    { name: 'CSV Results Export', status: 'Planned', progress: 0, health: '🔴' },
  ];

  return (
    <div className="flex bg-background min-h-screen text-text-primary font-outfit">
      <Sidebar role="admin" />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">System Status</h1>
            <p className="text-muted">Real-time health monitoring of all architectural layers.</p>
          </div>
          <div className="w-24 h-24 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * 0.72)} className="text-primary" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold">72%</span>
              <span className="text-[8px] text-muted font-bold uppercase">Ready</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Health Panel */}
          <div className="xl:col-span-2 glass rounded-[2rem] p-8">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold flex items-center gap-3">
                 <Activity className="text-primary" />
                 Component Health Layer
               </h3>
               <button className="p-3 bg-white/5 rounded-xl text-muted hover:text-text-primary transition-all">
                 <RefreshCw size={20} />
               </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {components.map((c, i) => (
                 <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-primary/20 transition-all">
                   <div className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-lg">
                     {c.health}
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between text-xs font-bold mb-1">
                       <span className="text-text-primary/80">{c.name}</span>
                       <span className="text-[10px] text-muted uppercase">{c.status}</span>
                     </div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${c.progress}%` }}
                         className={`h-full ${c.health === '🟢' ? 'bg-success' : c.health === '🟡' ? 'bg-warning' : 'bg-danger'}`}
                       />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-[2rem]">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Key className="text-primary" />
                Connection Keys
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-muted uppercase font-bold tracking-widest block mb-2">Supabase URL</label>
                  <input readOnly value="https://abc.supabase.co" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-muted" />
                </div>
                <div>
                  <label className="text-[10px] text-muted uppercase font-bold tracking-widest block mb-2">Service Role Key</label>
                  <input readOnly value="••••••••••••••••••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-muted" />
                </div>
                <div className="pt-4 flex items-center gap-4 text-xs font-bold uppercase tracking-tighter">
                   <div className="flex items-center gap-2 text-success">
                     <ShieldCheck size={16} /> TLS 1.2 ACTIVE
                   </div>
                   <div className="flex items-center gap-2 text-primary">
                     <Zap size={16} /> MQTT 8883
                   </div>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2rem] bg-primary/5 border-primary/20">
               <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Globe size={16} /> Deployment info
               </h3>
               <div className="space-y-2 text-xs text-muted font-mono leading-relaxed">
                 <div>Build: 2026.03.31-PROTOTYPE</div>
                 <div>Runtime: React 18 / Vite 5</div>
                 <div>MQTT: Mosquitto v2.0.15</div>
                 <div>Auth: HMAC-SHA256 Signed</div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemStatus;
