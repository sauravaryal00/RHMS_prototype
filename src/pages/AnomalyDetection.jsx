import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  Activity, 
  History,
  TrendingUp,
  Filter,
  BarChart2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAnomalyAlerts } from '../hooks/useAnomalyAlerts';

const AnomalyDetection = () => {
  const { alerts, triggerAnomaly } = useAnomalyAlerts();

  const anomalyRules = [
    { id: 'RULE-01', level: 'HIGH', description: 'Unauthorized access attempt from unverified IP range.' },
    { id: 'RULE-02', level: 'MEDIUM', description: 'Rapid sequential requests (brute force simulation).' },
    { id: 'RULE-03', level: 'HIGH', description: 'Access attempt on revoked or expired consent token.' },
    { id: 'RULE-04', level: 'MEDIUM', description: 'Geographic anomaly (clinician location mismatch).' }
  ];

  const handleTriggerSynthetic = async () => {
    await triggerAnomaly(
      'RULE-01',
      'HIGH',
      'ALERT: Unauthorized access attempt detected on Patient Vitals Stream.',
      'patient-42',
      'dr_malicious'
    );
  };

  return (
    <div className="flex bg-background min-h-screen text-text-primary">
      <Sidebar role="admin" />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-outfit">Anomaly Detection</h1>
            <p className="text-muted">Real-time heuristics and behavior monitoring</p>
          </div>
          <button 
            onClick={handleTriggerSynthetic}
            className="flex items-center gap-2 px-6 py-3 bg-danger/10 text-danger border border-danger/30 rounded-xl text-sm font-bold hover:bg-danger hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
          >
            <ShieldAlert size={18} /> TRIGGER SYNTHETIC ANOMALY
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Rules List */}
          <div className="lg:col-span-2 glass rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Monitoring Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anomalyRules.map((rule) => (
                <div key={rule.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between group hover:border-primary/30 transition-all">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">{rule.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        rule.level === 'HIGH' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-warning/10 text-warning border border-warning/20'
                      }`}>
                        {rule.level} SEVERITY
                      </span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed mb-4">{rule.description}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <div className="text-[8px] text-muted uppercase font-bold">Current Window Status</div>
                      <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.random() * 60}%` }}
                          className={`h-full ${rule.level === 'HIGH' ? 'bg-danger' : 'bg-warning'}`}
                        />
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-muted">LIVE</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-3xl">
              <h3 className="text-sm font-bold text-muted uppercase mb-6 tracking-widest">Alerts (Last 24h)</h3>
              <div className="h-48 flex items-end justify-between gap-2 px-2">
                {[4, 7, 2, 8, 5, 9, 3, 6, 4, 10, 6, 4].map((v, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${v * 8}%` }}
                    className={`w-full rounded-t ${v > 8 ? 'bg-danger/60' : 'bg-primary/40'}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[8px] text-muted font-mono">
                <span>12:00</span>
                <span>18:00</span>
                <span>00:00</span>
                <span>06:00</span>
              </div>
            </div>
            
            <div className="glass p-6 rounded-3xl bg-danger/5 border-danger/20">
              <div className="flex items-center gap-3 mb-2 text-danger">
                <AlertTriangle size={20} />
                <span className="font-bold">Critical Status</span>
              </div>
              <p className="text-xs text-danger/80">
                Rule 01 is currently seeing elevated activity from dr_sharma. Manual audit recommended.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="glass rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <History size={18} className="text-muted" />
              Live Alert Feed
            </h3>
            <span className="text-[10px] font-mono text-success animate-pulse uppercase">Monitoring Active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-muted uppercase tracking-widest border-b border-white/5">
                  <th className="p-6 font-medium">Severity</th>
                  <th className="p-6 font-medium">Triggered Rule</th>
                  <th className="p-6 font-medium">Requester</th>
                  <th className="p-6 font-medium">Patient</th>
                  <th className="p-6 font-medium">Details</th>
                  <th className="p-6 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <AnimatePresence>
                  {alerts.map((alert) => (
                    <motion.tr 
                      key={alert.id}
                      initial={{ opacity: 0, height: 0, x: -20 }}
                      animate={{ opacity: 1, height: 'auto', x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-all group"
                    >
                      <td className="p-6">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          alert.severity === 'HIGH' ? 'bg-danger text-white animate-pulse-danger' : 'bg-warning text-background font-bold'
                        }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="p-6 font-mono font-bold text-primary">{alert.rule_id}</td>
                      <td className="p-6 font-mono text-text-primary capitalize">{alert.requester_id}</td>
                      <td className="p-6 font-mono text-muted">{alert.patient_id}</td>
                      <td className="p-6 text-muted italic">{alert.details}</td>
                      <td className="p-6 font-mono text-[10px] text-muted">{new Date(alert.timestamp).toLocaleTimeString()}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes pulse-danger {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-pulse-danger {
          animation: pulse-danger 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default AnomalyDetection;
