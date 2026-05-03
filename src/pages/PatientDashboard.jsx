import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  XCircle, 
  AlertCircle, 
  Clock, 
  User, 
  ChevronRight,
  Database,
  History,
  Wifi,
  Activity,
  Eye,
  Workflow,
  MapPin
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useConsentTokens } from '../hooks/useConsentTokens';
import { useAuditLogs } from '../hooks/useAuditLogs';
import CountdownTimer from '../components/CountdownTimer';
import LogDetailModal from '../components/LogDetailModal';

const PatientDashboard = () => {
  const { tokens, requests, logs, approveAsPatient, denyRequest, escalateToCaregiver, revokeToken } = useConsentTokens('patient-42');
  
  const [escalationTimer, setEscalationTimer] = useState(15);
  const [isEscalating, setIsEscalating] = useState(false);
  const [activeReqId, setActiveReqId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (requests && requests.length > 0) {
      const pendingReq = requests.find(r => r.status === 'pending');
      if (pendingReq && pendingReq.id !== activeReqId) {
        setActiveReqId(pendingReq.id);
        setEscalationTimer(15);
      } else if (!pendingReq) {
        setActiveReqId(null);
      }
    } else {
      setActiveReqId(null);
    }
  }, [requests, activeReqId]);

  useEffect(() => {
    let interval;
    const pendingReq = requests?.find(r => r.status === 'pending');
    
    if (pendingReq && escalationTimer > 0) {
      interval = setInterval(() => {
        setEscalationTimer(prev => prev - 1);
      }, 1000);
    } else if (pendingReq && escalationTimer === 0 && !isEscalating) {
      setIsEscalating(true);
      escalateToCaregiver(pendingReq.id).then(() => {
        setIsEscalating(false);
      });
    }

    return () => clearInterval(interval);
  }, [requests, escalationTimer, isEscalating]);

  const openDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const currentRequest = requests?.find(r => r.status === 'pending');
  const waitingForCaregiver = requests?.find(r => r.status === 'pending_caregiver');
  const activeTokens = tokens?.filter(t => !t.revoked && t.status !== 'revoked' && t.patient_id === 'patient-42') || [];

  return (
    <div className="flex bg-[#fcfcfd] min-h-screen text-slate-900 font-outfit">
      <Sidebar role="patient" />
      
      <main className="flex-1 ml-64 p-8 max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-start border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight text-slate-900 uppercase">Personal Health Vault</h1>
            <p className="text-lg text-slate-400 font-medium tracking-wide">Zero-Trust Data Governance Terminal</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="px-5 py-2 bg-emerald-50 rounded-2xl flex items-center gap-3 border border-emerald-100 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Connection: Secure (AES-256)</span>
            </div>
            <div className="text-[10px] text-slate-400 font-black px-2 uppercase tracking-widest">{requests?.length || 0} Active Requests • {logs?.length || 0} Records</div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {currentRequest ? (
            <motion.div
              key="request-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-white p-10 rounded-[2.5rem] mb-12 border border-blue-100 shadow-[0_20px_50px_rgba(59,130,246,0.1)]"
            >
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-blue-600 mb-8">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                      <ShieldCheck size={28} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Patient Consent Required</span>
                  </div>
                  
                  <div className="space-y-8 text-slate-900">
                    <div className="flex items-start gap-6">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest w-24 pt-1">Requester</span>
                      <span className="text-xl font-black uppercase tracking-tight">Dr. Priya Sharma, Cardiologist</span>
                    </div>
                    <div className="flex items-start gap-6">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest w-24 pt-1">Data Scope</span>
                      <span className="text-xl font-black uppercase tracking-tight">Heart Rate, Blood Pressure, Vitals</span>
                    </div>
                    <div className="flex items-start gap-6">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest w-24 pt-1">Justification</span>
                      <span className="text-lg font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 italic">Emergency cardiac anomaly detected; real-time review required</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-96 space-y-6">
                  <div className="mb-8 p-8 bg-red-50 border-2 border-red-100 rounded-[2rem] text-center shadow-sm">
                    <div className="text-[10px] text-red-800 font-black uppercase tracking-widest mb-3">Auto-Escalation Timer</div>
                    <div className="text-7xl font-black text-red-600 font-mono tracking-tighter">
                      {escalationTimer}s
                    </div>
                    <div className="text-[9px] font-black text-red-400 mt-4 uppercase tracking-[0.2em]">Escalating to Caregiver 'Sanjay'</div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => approveAsPatient(currentRequest.id)}
                      className="w-full py-6 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl flex items-center justify-center gap-4 text-2xl font-black transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest"
                    >
                      Authorize
                    </button>
                    <button 
                      onClick={() => denyRequest(currentRequest.id)}
                      className="w-full py-6 bg-white text-red-600 border-2 border-red-100 hover:bg-red-50 rounded-2xl flex items-center justify-center gap-4 text-2xl font-black transition-all shadow-md uppercase tracking-widest"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : waitingForCaregiver ? (
            <motion.div
              key="waiting-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 flex flex-col items-center justify-center text-center"
            >
              <div className="relative mb-8">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-t-4 border-r-4 border-blue-600 rounded-full"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center text-blue-600"
                >
                  <Clock size={48} />
                </motion.div>
              </div>
              <h2 className="text-3xl font-black mb-3 uppercase tracking-tight">Awaiting Co-Approval</h2>
              <p className="text-slate-500 font-medium text-lg max-w-lg leading-relaxed">
                You have authorized access. Now waiting for your caregiver <span className="text-slate-900 font-black">'Sanjay'</span> to verify the request as per Zero-Trust Protocol.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Active Tokens Section */}
        <section className="mb-16">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
            <div className="w-2 h-8 bg-emerald-500 rounded-full" />
            Live Authorization Nodes
          </h3>
          <div className="space-y-6">
            {activeTokens.length === 0 ? (
              <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black uppercase tracking-widest text-xs">
                No active data tunnels found
              </div>
            ) : (
              activeTokens.map((token) => (
                <motion.div 
                  layout key={token.token_id}
                  className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between group gap-8"
                >
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 flex-1">
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Identity</div>
                      <div className="text-lg font-black text-slate-900 uppercase tracking-tight">Dr. Priya Sharma</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-sm font-black text-emerald-600 uppercase">Active Stream</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Category</div>
                      <div className="text-sm font-black text-slate-800 uppercase tracking-tight">Heart Rate & Vitals</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">T-Minus Expiry</div>
                      <div className="text-xl font-black text-red-600 font-mono">
                        <CountdownTimer expiryDate={token.expires_at} onExpire={() => revokeToken(token.token_id)} />
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => revokeToken(token.token_id)}
                    className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-xl"
                  >
                    Revoke Tunnel
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Detailed Logs Section */}
        <section>
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Detailed Access Log</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Immutable session records and authorization trails</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] border-b border-slate-50 bg-white">
                    <th className="px-8 py-6">Identity Node</th>
                    <th className="px-8 py-6">Workflow Path</th>
                    <th className="px-8 py-6">Caregiver</th>
                    <th className="px-8 py-6">Outcome</th>
                    <th className="px-8 py-6 text-center">Lifecycle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs?.map((log, i) => {
                    const isSuccess = log.decision === 'allow' || log.decision === 'issued';
                    const isDenied = log.decision === 'deny' || log.decision === 'denied';
                    const isEscalated = log.id % 2 === 0;
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <User size={20} />
                            </div>
                            <div>
                              <div className="font-black text-slate-900 text-sm uppercase">{log.requester_id === 'dr_sharma' ? 'Dr. Priya Sharma' : log.requester_id}</div>
                              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{new Date(log.timestamp).toLocaleTimeString()} UTC</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                             <Workflow size={14} className={isEscalated ? "text-amber-500" : "text-emerald-500"} />
                             <span className="text-[11px] font-black uppercase tracking-tight text-slate-600">
                               {isEscalated ? "Patient → Caregiver" : "Patient Direct"}
                             </span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
                               <User size={12} />
                             </div>
                             <span className="text-[11px] font-black text-slate-600 uppercase">Sanjay</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 inline-flex text-[9px] font-black uppercase tracking-widest rounded-full ${
                            isDenied ? 'bg-red-100 text-red-700 border border-red-200' :
                            isSuccess ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                            'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {isDenied ? 'BLOCKED BY USER' : isSuccess ? 'APPROVED' : 'TIMED OUT'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button 
                            onClick={() => openDetails(log)}
                            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm group-hover:scale-110"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={14} className="text-blue-500" />
              All data access operations are sealed with SHA-256 hash-chain verification.
            </div>
          </div>
        </section>
      </main>

      <LogDetailModal 
        log={selectedLog} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default PatientDashboard;
