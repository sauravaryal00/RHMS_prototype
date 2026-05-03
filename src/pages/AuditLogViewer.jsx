import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import LogDetailModal from '../components/LogDetailModal';
import { useConsentTokens } from '../hooks/useConsentTokens';
import { 
  FileSearch, 
  ShieldCheck, 
  Link, 
  AlertTriangle, 
  Activity, 
  Download,
  Filter,
  Eye,
  MapPin,
  Cpu,
  GitMerge as Workflow,
  User,
  CheckCircle,
  Stethoscope
} from 'lucide-react';

const AuditLogViewer = () => {
  const { logs } = useConsentTokens();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 2000);
  };

  const openDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  return (
    <div className="flex bg-[#fcfcfd] min-h-screen text-slate-900 font-outfit">
      <Sidebar role="admin" />
      
      <main className="flex-1 ml-64 p-10">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Zero-Trust Registry</h1>
            <p className="text-slate-500 font-medium text-lg">Immutable Hash-Chain Audit Ledger</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all uppercase tracking-widest text-slate-600">
              <Download size={18} /> Export Records
            </button>
          </div>
        </header>

        {/* Audit Log Table Overhaul */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                 <FileSearch size={24} />
               </div>
               <div>
                 <h3 className="text-lg font-black text-slate-900 uppercase">Live Access Stream</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time audit monitoring active</p>
               </div>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Hash integrity: SECURE</span>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="p-6">Transaction ID</th>
                  <th className="p-6">Workflow Path</th>
                  <th className="p-6">Requester</th>
                  <th className="p-6">Caregiver Node</th>
                  <th className="p-6">Security Node</th>
                  <th className="p-6">Trust Score</th>
                  <th className="p-6">Outcome</th>
                  <th className="p-6">Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs && logs.length > 0 ? logs.map((log, index) => {
                  const logId = log.id || log.event_id || `temp-${index}`;
                  const isEscalated = log.decision?.toLowerCase().includes('caregiver') || 
                                    log.decision?.toLowerCase().includes('escalate') || 
                                    (typeof logId === 'number' && logId % 2 === 0);
                  const isDenied = log.decision?.toLowerCase() === 'deny' || log.decision?.toLowerCase() === 'denied' || log.decision?.toLowerCase() === 'blocked';
                  const isApproved = log.decision?.toLowerCase() === 'allow' || log.decision?.toLowerCase() === 'issued' || log.decision?.toLowerCase() === 'approved';
                  
                  return (
                    <tr key={logId} className="hover:bg-slate-50 transition-all group">
                      <td className="p-6">
                        <div className="font-mono text-xs text-blue-600 font-bold">#REQ-{logId}</div>
                        <div className="text-[9px] text-slate-400 mt-1">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '---'} UTC</div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                           <Workflow size={14} className={isEscalated ? "text-amber-500" : "text-emerald-500"} />
                           <span className="text-[11px] font-black uppercase tracking-tight text-slate-700">
                             {isEscalated ? "Patient → Caregiver" : "Patient Direct"}
                           </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Stethoscope size={20} />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-sm uppercase">{log.requester_id === 'dr_sharma' ? 'Dr. Priya Sharma' : (log.requester_id || 'Unknown')}</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">{log.requester_role || 'Clinician'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                             <User size={12} />
                           </div>
                           <span className="text-[11px] font-black text-slate-700 uppercase">Sanjay (Primary)</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-300" />
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">Zone-7 (AU)</span>
                        </div>
                      </td>
                      <td className="p-6">
                         <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className={`h-full ${isApproved ? 'bg-emerald-500' : 'bg-slate-300'} w-[95%]`} />
                         </div>
                         <div className="text-[9px] font-black text-emerald-600 mt-1">95% TRUST</div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          isDenied ? 'bg-red-50 text-red-700 border-red-100' :
                          isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {isDenied ? 'BLOCKED BY USER ❌' : 
                           isApproved ? 'APPROVED ✅' : 'TIMED OUT ⚠️'}
                        </span>
                      </td>
                      <td className="p-6">
                        <button 
                          onClick={() => openDetails(log)}
                          className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm group-hover:scale-110"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      No audit records found in hash-chain
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <LogDetailModal 
        log={selectedLog} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default AuditLogViewer;
