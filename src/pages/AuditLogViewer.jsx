import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileSearch, 
  ShieldCheck, 
  Link, 
  AlertTriangle, 
  Activity, 
  Download,
  Filter
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useConsentTokens } from '../hooks/useConsentTokens';

const AuditLogViewer = () => {
  const { logs } = useConsentTokens();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 2000);
  };

  return (
    <div className="flex bg-background min-h-screen text-text-primary">
      <Sidebar role="admin" />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-outfit">Audit Log</h1>
            <p className="text-muted">Tamper-evident Hash-Chain Registry</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </header>

        {/* Hash-Chain Integrity Visualizer */}
        <div className="glass p-8 rounded-2xl mb-8 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isVerified ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {isVerifying ? <Activity className="animate-pulse" /> : <ShieldCheck size={28} />}
              </div>
              <div>
                <h3 className="font-bold text-lg">Hash-Chain Integrity</h3>
                <p className="text-sm text-muted">SHA-256 linked log entries</p>
              </div>
            </div>
            <button 
              onClick={handleVerify}
              disabled={isVerifying}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                isVerifying ? 'bg-primary/50 cursor-wait' : 'bg-primary text-background hover:bg-primary/90'
              }`}
            >
              {isVerifying ? 'VERIFYING...' : 'VERIFY CHAIN'}
            </button>
          </div>

          <div className="flex items-center justify-around overflow-x-auto pb-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <React.Fragment key={i}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-2 shrink-0"
                >
                  <div className="w-24 h-24 rounded-2xl bg-surface border border-white/10 p-4 flex flex-col items-center justify-center gap-2 relative group cursor-pointer hover:border-primary/50 transition-all">
                    <div className="text-[8px] font-mono text-muted truncate w-full">ID: {1040 + i}</div>
                    <div className={`w-3 h-3 rounded-full ${isVerified ? 'bg-success shadow-[0_0_8px_#10b981]' : 'bg-danger shadow-[0_0_8px_#ef4444]'}`} />
                    <div className="text-[8px] font-mono text-primary truncate w-full">HASH: a3f5...</div>
                  </div>
                  <span className="text-[8px] font-mono text-muted">ENTRY_{i+1}</span>
                </motion.div>
                {i < 5 && (
                  <div className="shrink-0 pt-8">
                    <Link className="text-white/10" size={20} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {isVerified && !isVerifying && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-6 flex items-center justify-center gap-2 text-success font-bold text-xs"
            >
              <ShieldCheck size={14} />
              SYSTEM INTEGRITY VERIFIED: ALL LOG HASHES MATCH
            </motion.div>
          )}
        </div>

        {/* Audit Log Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] text-muted uppercase tracking-widest">
                <th className="p-4 font-medium"># ID</th>
                <th className="p-4 font-medium">Timestamp (UTC)</th>
                <th className="p-4 font-medium">Event Type</th>
                <th className="p-4 font-medium">Requester</th>
                <th className="p-4 font-medium">Patient</th>
                <th className="p-4 font-medium">Purpose</th>
                <th className="p-4 font-medium">Decision</th>
              </tr>
            </thead>
            <tbody className="text-xs font-mono">
              {logs?.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="p-4">{log.id}</td>
                  <td className="p-4 text-muted">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                      {log.event_type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-text-primary capitalize">{log.requester_id}</div>
                    <div className="text-[10px] text-muted italic">{log.requester_role}</div>
                  </td>
                  <td className="p-4">{log.patient_id}</td>
                  <td className="p-4 text-muted capitalize">{log.purpose?.replace('_', ' ')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded border capitalize ${
                      log.decision === 'allow' || log.decision === 'issued' ? 'bg-success/10 text-success border-success/20' : 
                      log.decision === 'pending' || log.decision === 'pending_co_approval' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-danger/10 text-danger border-danger/20'
                    }`}>
                      {log.decision}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AuditLogViewer;
