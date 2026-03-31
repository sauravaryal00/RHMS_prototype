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
  Wifi
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useConsentTokens } from '../hooks/useConsentTokens';
import { useAuditLogs } from '../hooks/useAuditLogs';
import CountdownTimer from '../components/CountdownTimer';

const PatientDashboard = () => {
  const { tokens, requests, logs, approveAsPatient, denyRequest, revokeToken } = useConsentTokens('patient-42');
  
  useEffect(() => {
    console.log('PATIENT_SYNC: Detected', requests?.length, 'active requests');
  }, [requests]);

  const [processingId, setProcessingId] = useState(null);
  const [requestStatus, setRequestStatus] = useState('pending'); // pending, allowed, denied

  useEffect(() => {
    console.log('PATIENT_DEBUG: Requests state changed', requests);
    if (requests && requests.length > 0) {
      console.log('PATIENT_DEBUG: Request 0 status:', requests[0].status);
    }
  }, [requests]);

  const isHighRiskPurpose = (req) => {
    if (!req) return false;
    const purp = (req.purpose || '').toLowerCase();
    const scopeStr = (req.scope || []).join(',').toLowerCase();
    return purp.includes('emergency') || 
           purp.includes('symptom') || 
           purp.includes('review') ||
           scopeStr.includes('heart') || 
           scopeStr.includes('blood') || 
           scopeStr.includes('vitals');
  };

  // Logic: Show pending OR those waiting for caregiver
  const currentRequest = requests?.find(r => r.status === 'pending');
  const waitingForCaregiver = requests?.find(r => r.status === 'pending_caregiver');
  const activeTokens = tokens?.filter(t => !t.revoked && t.status !== 'revoked' && t.patient_id === 'patient-42') || [];
  const patientLogs = logs?.slice(0, 5) || [];

  const handleAllow = async (id) => {
    setProcessingId(id);
    setRequestStatus('allowed');
    await approveAsPatient(id);
    // Remove timeout - let the state update from hook handle the disappearance
  };

  const handleDeny = async (id) => {
    setProcessingId(id);
    setRequestStatus('denied');
    await denyRequest(id);
  };

  return (
    <div className="flex bg-background min-h-screen text-text-primary">
      <Sidebar role="patient" />
      
      <main className="flex-1 ml-64 p-8 max-w-5xl mx-auto">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black mb-4 tracking-tight">Privacy Center</h1>
            <p className="text-xl text-muted">You are in full control of who sees your health data.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-2 glass rounded-2xl flex items-center gap-3 border border-success/30">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-xs font-bold text-success font-mono uppercase tracking-widest">Live Sync Connected</span>
            </div>
            <div className="text-[10px] text-muted font-bold px-2">{requests?.length || 0} ACTIVE_REQUESTS • {logs?.length || 0} AUDIT_LOGS</div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {currentRequest ? (
            <motion.div
              key="request-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="glass p-10 rounded-[2.5rem] mb-12 border-2 border-primary shadow-[0_0_40px_rgba(0,212,255,0.15)]"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-primary mb-4">
                    <ShieldCheck size={32} />
                    <span className="text-sm font-bold uppercase tracking-[0.2em]">New Access Request</span>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    {currentRequest.clinician_name}
                    <span className="text-sm font-normal px-3 py-1 bg-white/5 rounded-full text-muted">{currentRequest.clinician_role}</span>
                  </h2>
                  
                  <p className="text-xl mb-6 text-text-primary/90 leading-relaxed italic">
                    "{currentRequest.purpose}"
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-lg">
                      <Database className="text-primary" />
                      <div>
                        <span className="text-muted">Data: </span>
                        <span className="font-semibold">{currentRequest.scope?.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-lg">
                      <Clock className="text-warning" />
                      <div>
                        <span className="text-muted">Duration: </span>
                        <span className="font-semibold">{currentRequest.duration_minutes} Minutes</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-80 space-y-4">
                  <button 
                    onClick={() => handleAllow(currentRequest.id)}
                    className="w-full h-24 bg-success/20 text-success border-2 border-success/30 hover:bg-success hover:text-white rounded-2xl flex items-center justify-center gap-4 text-2xl font-bold transition-all"
                  >
                    <ShieldCheck size={32} />
                    ALLOW
                  </button>
                  <button 
                    onClick={() => handleDeny(currentRequest.id)}
                    className="w-full h-24 bg-danger/20 text-danger border-2 border-danger/30 hover:bg-danger hover:text-white rounded-2xl flex items-center justify-center gap-4 text-2xl font-bold transition-all"
                  >
                    <XCircle size={32} />
                    DENY
                  </button>
                </div>
              </div>
            </motion.div>
          ) : waitingForCaregiver ? (
            <motion.div
              key="waiting-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center"
            >
              <div className="relative mb-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-t-2 border-r-2 border-primary rounded-full"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center text-primary"
                >
                  <Clock size={32} />
                </motion.div>
              </div>
              <h2 className="text-3xl font-bold mb-2 animate-pulse">Waiting for Caregiver Co-approval</h2>
              <p className="text-muted text-lg max-w-md">
                You have authorized access for {waitingForCaregiver.clinician_name}. 
                Now waiting for your caregiver to verify the request as per zero-trust protocol.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl font-bold font-outfit mb-6 flex items-center gap-3">
              <ShieldCheck className="text-primary" />
              Active Access
            </h3>
            <div className="space-y-4">
              {activeTokens.length === 0 ? (
                <div className="p-8 text-center glass rounded-3xl text-muted">
                  No one has access to your data right now.
                </div>
              ) : (
                activeTokens.map((token) => (
                  <motion.div 
                    layout
                    key={token.token_id}
                    className="glass p-6 rounded-3xl border border-primary/20 flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-lg font-bold">{token.clinician_id}</div>
                      <div className="text-sm text-muted mb-3">{token.clinician_role} • {token.purpose.replace('_', ' ')}</div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-warning/10 text-warning rounded-full text-xs w-fit">
                        <Clock size={12} />
                        Time Remaining: <span className="font-mono">
                          <CountdownTimer 
                            expiryDate={token.expires_at} 
                            onExpire={() => revokeToken(token.token_id)} 
                          />
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => revokeToken(token.token_id)}
                      className="p-4 bg-warning/10 text-warning hover:bg-warning hover:text-background rounded-2xl transition-all font-bold"
                    >
                      REVOKE
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold font-outfit mb-6 flex items-center gap-3">
              <History className="text-muted" />
              Access History
            </h3>
            <div className="space-y-4">
              {patientLogs.length === 0 ? (
                <div className="p-8 text-center glass rounded-3xl text-muted text-sm italic">
                  History is empty. New logs will appear here in real-time.
                </div>
              ) : (
                patientLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      log.decision === 'allow' || log.decision === 'issued' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {log.decision === 'allow' || log.decision === 'issued' ? <ShieldCheck size={24} /> : <XCircle size={24} />}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">{log.requester_id} <span className="font-normal text-muted">{log.event_type.replace('_', ' ').toLowerCase()}</span></div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <div className="text-[10px] text-muted flex items-center gap-1 font-mono">
                          <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                        {log.patient_latency_ms && (
                          <div className="text-[10px] text-primary font-mono font-bold flex items-center gap-1">
                            <span className="opacity-50">PATIENT:</span> {Math.round(log.patient_latency_ms)}ms
                          </div>
                        )}
                        {log.caregiver_latency_ms && (
                          <div className="text-[10px] text-warning font-mono font-bold flex items-center gap-1">
                            <span className="opacity-50">CAREGIVER:</span> {Math.round(log.caregiver_latency_ms)}ms
                          </div>
                        )}
                        {log.total_latency_ms && (
                          <div className="text-[10px] text-success font-mono font-black border-l pl-2 flex items-center gap-1">
                            <span className="opacity-50 text-[8px]">TOTAL:</span> {Math.round(log.total_latency_ms)}ms
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                      (log?.decision === 'allow' || log?.decision === 'issued') ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {log?.decision?.toUpperCase() === 'ALLOW' ? 'APPROVED' : (log?.decision?.toUpperCase() || 'UNKNOWN').replace('_', ' ')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;
