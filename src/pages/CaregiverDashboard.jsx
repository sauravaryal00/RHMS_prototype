import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  Activity,
  User,
  ArrowRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useConsentTokens } from '../hooks/useConsentTokens';
const CaregiverDashboard = () => {
  const { requests = [], approveAsCaregiver = () => {}, denyRequest = () => {} } = useConsentTokens() || {};
  const [processingId, setProcessingId] = useState(null);

  const pendingCoApprovals = Array.isArray(requests) 
    ? requests.filter(r => r && r.status === 'pending_caregiver') 
    : [];
  
  const pendingCoApproval = pendingCoApprovals[0];
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (!pendingCoApproval) return;
    
    const calculateTime = () => {
      const created = new Date(pendingCoApproval.created_at).getTime();
      const expires = created + (5 * 60 * 1000);
      const remaining = Math.max(0, Math.floor((expires - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [pendingCoApproval]);

  useEffect(() => {
    console.log('CAREGIVER_SYNC: Data received', requests?.length || 0);
  }, [requests]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex bg-background min-h-screen text-text-primary font-outfit">
      <Sidebar role="caregiver" />
      
      <main className="flex-1 ml-64 p-8 max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Care-Pair Co-Approval</h1>
            <p className="text-muted">Dual-authorization for high-risk access</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-2 glass rounded-2xl flex items-center gap-3 border border-success/30">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-bold text-success font-mono uppercase tracking-widest leading-none">Sync Active</span>
            </div>
            <div className="text-[10px] text-muted font-bold font-mono px-2 uppercase tracking-tighter">
              Queue: {pendingCoApprovals.length} PENDING
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Main Action Area */}
          <div className="glass p-8 rounded-[2.5rem] border-primary/20 min-h-[500px] flex flex-col">
            {!pendingCoApproval ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center text-success mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Queue is Clear</h2>
                <p className="text-muted text-lg">Waiting for high-risk patient approval events...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={pendingCoApproval.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div className="px-4 py-1.5 bg-danger/10 text-danger border border-danger/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                      Action Required: High-Risk
                    </div>
                    <div className="flex items-center gap-2 text-2xl font-mono font-bold text-warning">
                      <Clock size={20} />
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  <h2 className="text-4xl font-black mb-6 tracking-tight line-clamp-1">{pendingCoApproval.clinician_name}</h2>
                  
                  <div className="space-y-6 flex-1">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex items-start gap-4">
                        <User className="text-primary mt-1" size={20} />
                        <div>
                          <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Target Patient</p>
                          <p className="text-lg font-bold">{pendingCoApproval.patient_id}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Activity className="text-primary mt-1" size={20} />
                        <div>
                          <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Purpose</p>
                          <p className="text-lg font-bold italic">"{pendingCoApproval.purpose}"</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <ShieldCheck className="text-primary mt-1" size={20} />
                        <div>
                          <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Data Scope</p>
                          <p className="text-lg font-bold">{Array.isArray(pendingCoApproval.scope) ? pendingCoApproval.scope.join(', ') : 'All Vitals'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-10">
                    <button 
                      onClick={async () => {
                        setProcessingId(pendingCoApproval.id);
                        await approveAsCaregiver(pendingCoApproval.id);
                      }}
                      className="flex-1 h-24 bg-success text-background text-2xl font-black rounded-3xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
                    >
                      APPROVE
                    </button>
                    <button 
                      onClick={async () => {
                        await denyRequest(pendingCoApproval.id);
                      }}
                      className="flex-1 h-24 bg-white/5 border-2 border-white/10 text-muted hover:bg-danger hover:text-white hover:border-danger text-2xl font-bold rounded-3xl transition-all"
                    >
                      DENY
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Simple Step Guide */}
          <div className="flex flex-col gap-6">
            <div className="glass p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <ShieldCheck className="text-primary" /> Security Protocol
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-success text-background flex items-center justify-center shrink-0 font-bold">1</div>
                  <p className="text-sm text-muted leading-relaxed">System identified high-risk heart/vital data request. Patient has granted initial consent.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center shrink-0 font-bold font-mono animate-pulse">2</div>
                  <p className="text-sm font-bold leading-relaxed">Requirement: Care-Pair Co-Approval. You must verify the clinician's purpose before final token issuance.</p>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] bg-primary/5 border-primary/20 flex-1 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Activity size={120} />
               </div>
               <h3 className="text-xl font-bold mb-2">Zero-Trust Active</h3>
               <p className="text-sm text-primary/70 mb-8">No data is sent to the clinician until both keys are activated.</p>
               <div className="flex items-center gap-6">
                 <div className="flex flex-col items-center gap-1">
                   <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center text-background">
                     <CheckCircle2 size={24} />
                   </div>
                   <div className="text-[8px] font-mono font-bold">PATIENT</div>
                 </div>
                 <div className="h-px bg-white/10 flex-1 border-t border-dashed border-white/20" />
                 <div className="flex flex-col items-center gap-1">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pendingCoApproval ? 'bg-warning animate-pulse text-background' : 'bg-white/10 text-muted'}`}>
                     <Users size={24} />
                   </div>
                   <div className="text-[8px] font-mono font-bold">CAREGIVER</div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaregiverDashboard;
