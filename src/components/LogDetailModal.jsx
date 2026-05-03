import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  MapPin, 
  Clock, 
  Activity, 
  UserCheck, 
  AlertTriangle,
  ArrowRight,
  Stethoscope,
  User,
  Bot
} from 'lucide-react';

const LogDetailModal = ({ log, isOpen, onClose }) => {
  if (!log || !isOpen) return null;

  const isEscalated = log.decision?.includes('caregiver') || log.id % 2 === 0; // Mock logic for demo

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security Audit Report</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Transaction ID: {log.id}-{Date.now().toString().slice(-6)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            
            {/* Identity Nodes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Requester Node</div>
                  <div className="text-sm font-black text-slate-900 uppercase">Dr. Priya Sharma</div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  {isEscalated ? <UserCheck size={24} /> : <User size={24} />}
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Responder Node</div>
                  <div className="text-sm font-black text-slate-900 uppercase">{isEscalated ? "Caregiver (Sanjay)" : "Patient (Saurav)"}</div>
                </div>
              </div>
            </div>

            {/* Workflow Visualization */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Authentication Lifecycle</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-2 border-blue-200">
                    <Lock size={18} />
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-600">Token Issued</span>
                </div>
                <ArrowRight size={16} className="text-slate-300 mb-6" />
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isEscalated ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                    {isEscalated ? <Bot size={18} className="animate-pulse" /> : <Activity size={18} />}
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-600">Patient Check</span>
                </div>
                <ArrowRight size={16} className="text-slate-300 mb-6" />
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isEscalated ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-300 border-slate-200'}`}>
                    <UserCheck size={18} />
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-600">Caregiver</span>
                </div>
                <ArrowRight size={16} className="text-slate-300 mb-6" />
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-emerald-700 shadow-lg">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-600">Data Access</span>
                </div>
              </div>
            </div>

            {/* Security Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <Cpu size={16} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encryption</span>
                </div>
                <div className="text-sm font-black text-slate-800">AES-256 + RSA-4096</div>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={16} className="text-red-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Geo Node</span>
                </div>
                <div className="text-sm font-black text-slate-800">Sydney, AU [Zone-7]</div>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={16} className="text-amber-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session TTL</span>
                </div>
                <div className="text-sm font-black text-slate-800">1800 Seconds (Fixed)</div>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Score</span>
                </div>
                <div className="text-sm font-black text-slate-800">98/100 (High Trust)</div>
              </div>
            </div>

            {/* Detailed Event Log */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Raw Payload Hash</h3>
              <div className="p-4 bg-slate-900 rounded-xl font-mono text-[10px] text-emerald-400 break-all leading-relaxed border border-slate-800">
                SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </div>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle size={18} className="text-blue-600" />
                <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Access Decision Narrative</h4>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                {isEscalated 
                  ? "The patient failed to respond within the 15-second critical window. The request was automatically escalated to the Caregiver as per the Zero-Trust fail-safe protocol. Caregiver 'Sanjay' provided the final authorization."
                  : "The patient successfully reviewed and authorized the request within the priority window. Session token was minted with single-use scope for 'Cardiac Vitals'."}
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black transition-all"
            >
              Close Report
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LogDetailModal;
