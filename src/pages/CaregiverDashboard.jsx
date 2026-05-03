import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  Activity,
  User,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useConsentTokens } from '../hooks/useConsentTokens';
const CaregiverDashboard = () => {
  const { requests = [], approveAsCaregiver = () => {}, denyRequest = () => {} } = useConsentTokens() || {};
  const [processingId, setProcessingId] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

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
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Care-Pair Co-Approval</h1>
            <p className="text-slate-500">Dual-authorization for high-risk access</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-2 bg-white rounded-xl flex items-center gap-3 border border-emerald-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-bold text-emerald-600 font-mono uppercase tracking-widest leading-none">Sync Active</span>
            </div>
            <div className="text-[10px] text-muted font-bold font-mono px-2 uppercase tracking-tighter">
              Queue: {pendingCoApprovals.length} PENDING
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Main Action Area */}
          <div className={`bg-white p-8 rounded-3xl border shadow-md min-h-[500px] flex flex-col transition-all duration-500 ${pendingCoApproval?.is_auto_escalated ? 'border-red-300 shadow-[0_0_50px_rgba(239,68,68,0.05)] ring-1 ring-red-100' : 'border-slate-200'}`}>
            {!pendingCoApproval ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-slate-800">Queue is Clear</h2>
                <p className="text-slate-500 text-lg">Waiting for high-risk patient approval events...</p>
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
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        <div className="font-bold flex items-center gap-2 mb-1 uppercase text-xs tracking-widest">
                          <AlertCircle size={16} /> System-Verified Emergency Override Request
                        </div>
                        <p className="text-sm">The patient did not respond within the defined 15-second time window, triggering this emergency escalation to you as their verified Caregiver.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-3xl font-black tracking-tight text-slate-800">Dr. Priya Sharma</h2>
                     <div className="flex items-center gap-2 text-2xl font-mono font-bold text-amber-500">
                      <Clock size={20} />
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  <h2 className="text-4xl font-black mb-6 tracking-tight line-clamp-1">{pendingCoApproval.clinician_name}</h2>
                  
                  <div className="space-y-4 flex-1 text-slate-700">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-start gap-4">
                        <User className="text-blue-500 mt-1" size={20} />
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Requesting Identity</p>
                          <p className="text-lg font-bold text-slate-800">Dr. Priya Sharma</p>
                          <p className="text-sm">Cardiologist, City Health Hospital</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Activity className="text-blue-500 mt-1" size={20} />
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Purpose</p>
                          <p className="text-lg font-bold text-slate-800">Emergency cardiac anomaly detected – clinician review required</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <ShieldCheck className="text-blue-500 mt-1" size={20} />
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Explicit Data Scope</p>
                          <p className="text-lg font-bold text-slate-800">Heart Rate, Blood Pressure, Oxygen Levels</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">Access Type: View-only</span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold">Duration: 30 minutes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                      />
                      <div className="text-sm text-slate-700">
                        <span className="font-bold block">I confirm this is an emergency override.</span>
                        As a registered and verified emergency contact, I authorize this view-only access. I understand this action is recorded and auditable.
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button 
                      disabled={!isConfirmed}
                      onClick={async () => {
                        setProcessingId(pendingCoApproval.id);
                        await approveAsCaregiver(pendingCoApproval.id);
                      }}
                      className={`flex-1 h-16 text-white text-xl font-black rounded-xl transition-all shadow-md ${isConfirmed ? 'bg-emerald-500 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95' : 'bg-slate-300 cursor-not-allowed'}`}
                    >
                      APPROVE OVERRIDE
                    </button>
                    <button 
                      onClick={async () => {
                        await denyRequest(pendingCoApproval.id);
                      }}
                      className="flex-1 h-16 bg-white border border-slate-300 text-red-500 hover:bg-red-50 text-xl font-bold rounded-xl transition-all shadow-sm"
                    >
                      DENY
                    </button>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Data is only released after either patient approval or verified caregiver override.</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Simple Step Guide */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                 <ShieldCheck className="text-blue-500" /> Security Protocol
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 font-bold border border-slate-200">1</div>
                  <p className="text-sm text-slate-600 leading-relaxed">System identified high-risk heart/vital data request. Patient did not respond in 15s.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold font-mono">2</div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">Requirement: Emergency Override. You must verify the clinician's purpose before final token issuance.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex-1 relative overflow-hidden shadow-sm">
               <div className="absolute top-0 right-0 p-8 opacity-10 text-blue-500">
                 <Activity size={120} />
               </div>
               <h3 className="text-xl font-bold mb-2 text-slate-800">Zero-Trust Active</h3>
               <p className="text-sm text-slate-600 mb-8">Access can be revoked at any time by the patient or system.</p>
               <div className="flex items-center gap-6">
                 <div className="flex flex-col items-center gap-1">
                   <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                     <CheckCircle2 size={24} />
                   </div>
                   <div className="text-[8px] font-mono font-bold text-slate-500">PATIENT</div>
                 </div>
                 <div className="h-px bg-slate-300 flex-1 border-t border-dashed border-slate-300" />
                 <div className="flex flex-col items-center gap-1">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pendingCoApproval ? 'bg-amber-100 text-amber-600 shadow-sm border border-amber-200' : 'bg-slate-200 text-slate-400'}`}>
                     <Users size={24} />
                   </div>
                   <div className="text-[8px] font-mono font-bold text-slate-500">CAREGIVER</div>
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
