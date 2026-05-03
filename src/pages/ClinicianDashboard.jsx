import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Lock,
  Unlock,
  Eye,
  FileText
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import VitalsChart from '../components/VitalsChart';
import PolicyGatewaySteps from '../components/PolicyGatewaySteps';
import { useRealtimeVitals } from '../hooks/useRealtimeVitals';
import { useConsentTokens } from '../hooks/useConsentTokens';
import CountdownTimer from '../components/CountdownTimer';

const ClinicianDashboard = () => {
  const clinicians = [
    { id: 'dr_sharma', name: 'Dr. Priya Sharma', role: 'Cardiologist', dept: 'Cardiology' },
    { id: 'dr_kumar', name: 'Dr. Rajesh Kumar', role: 'Neurologist', dept: 'Neurology' },
    { id: 'dr_jenkins', name: 'Dr. Sarah Jenkins', role: 'ER Specialist', dept: 'Emergency' }
  ];

  const [selectedClinician, setSelectedClinician] = useState(clinicians[0]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStep, setValidationStep] = useState(0);
  const [patientId, setPatientId] = useState('patient-42');
  const [purpose, setPurpose] = useState('Emergency cardiac anomaly detected – clinician review required');
  const [duration, setDuration] = useState(30);
  
  const { tokens, requests, requestAccess } = useConsentTokens();
  const { vitals, history, connectionStatus } = useRealtimeVitals(patientId);

  // Check for active token or pending request
  const activeToken = tokens?.find(t => t.clinician_id === selectedClinician.id && !t.revoked && t.patient_id === patientId);
  const pendingRequest = requests?.find(r => 
    r.clinician_id === selectedClinician.id && 
    r.patient_id === patientId && 
    (r.status === 'pending' || r.status === 'pending_caregiver')
  );

  const validationSteps = [
    { label: 'Token present in Authorization header', status: 'pass' },
    { label: 'HMAC-SHA256 signature valid', status: 'pass' },
    { label: 'Token not expired', status: 'pass' },
    { label: 'Token not revoked', status: 'pass' },
    { label: 'Purpose matches request', status: 'pass' },
    { label: 'Clinician role matches', status: 'pass' },
    { label: 'Patient ID matches', status: 'pass' },
  ];

  const handleRequestAccess = async (e) => {
    if (e) e.preventDefault();
    if (isRequesting || pendingRequest) return;

    setIsRequesting(true);
    try {
      await requestAccess(
        patientId, 
        selectedClinician.id, 
        selectedClinician.name, 
        selectedClinician.role, 
        purpose, 
        ['Heart Rate', 'Blood Pressure', 'Oxygen Levels'], 
        duration
      );
    } catch (err) {
      console.error('RHMS_ERROR: Request failed', err);
    } finally {
      setIsRequesting(false);
    }
  };

  const runValidationChain = () => {
    setIsValidating(true);
    setValidationStep(0);
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setValidationStep(step);
      if (step >= validationSteps.length) {
        clearInterval(interval);
        setIsValidating(false);
      }
    }, 400);
  };

  useEffect(() => {
    if (activeToken && !isValidating && validationStep === 0) {
      runValidationChain();
    }
  }, [activeToken]);

  return (
    <div className="flex bg-background min-h-screen text-text-primary">
      <Sidebar role="clinician" />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <h1 className="text-4xl font-bold font-outfit text-slate-800 mb-2">Clinician Portal</h1>
          <p className="text-slate-500 text-lg">{selectedClinician.dept} Department | {selectedClinician.name}</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Request Panel */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800">
                <Send size={20} className="text-blue-600" />
                Request Access Panel
              </h3>
              
              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div>
                  <label className="text-[10px] text-muted uppercase font-bold tracking-widest block mb-2">Patient ID</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                    <input 
                      type="text" 
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary/50 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-muted uppercase font-bold tracking-widest block mb-2">Select Clinician</label>
                  <select 
                    value={selectedClinician.id}
                    onChange={(e) => setSelectedClinician(clinicians.find(c => c.id === e.target.value))}
                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-sm appearance-none"
                  >
                    {clinicians.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-2">Purpose</label>
                  <select 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm appearance-none text-slate-800"
                  >
                    <option value="Emergency cardiac anomaly detected – clinician review required">Emergency cardiac anomaly detected – clinician review required</option>
                    <option value="Symptom Review">Symptom Review</option>
                    <option value="Routine Check">Routine Check</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-2">Duration (mins)</label>
                  <input 
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm text-slate-800"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isRequesting || pendingRequest}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-md mt-4"
                >
                  {isRequesting || pendingRequest ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {pendingRequest?.status === 'pending_caregiver' 
                        ? 'Waiting for Caregiver...' 
                        : 'Waiting for patient approval'}
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      Request Patient Consent
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800">
                <ShieldCheck size={20} className="text-emerald-500" />
                Policy Gateway Status
              </h3>
              
              <div className="grid grid-cols-3 gap-2 mb-8">
                <div className={`p-3 rounded-lg text-center border ${activeToken ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-1">Consent</div>
                  <div className="font-mono text-xs font-bold">{activeToken ? 'GRANTED' : pendingRequest ? 'PENDING' : 'NONE'}</div>
                </div>
                <div className={`p-3 rounded-lg text-center border ${activeToken ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-1">Token</div>
                  <div className="font-mono text-xs font-bold">{activeToken ? 'ISSUED' : 'NONE'}</div>
                </div>
                <div className={`p-3 rounded-lg text-center border ${activeToken && validationStep === validationSteps.length ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-1">Access</div>
                  <div className="font-mono text-xs font-bold">{activeToken && validationStep === validationSteps.length ? 'ALLOWED' : 'RESTRICTED'}</div>
                </div>
              </div>
              <PolicyGatewaySteps 
                steps={validationSteps} 
                currentStep={validationStep} 
                isValidating={isValidating}
              />
              {validationStep === validationSteps.length && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-success/10 border border-success/30 rounded-xl text-center"
                >
                  <div className="text-success font-bold flex items-center justify-center gap-2 mb-1">
                    <Unlock size={18} />
                    ACCESS GRANTED
                  </div>
                  <div className="text-[10px] text-success/70 font-mono tracking-tighter">TOKEN: {activeToken?.token_id.toUpperCase()}</div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="xl:col-span-2">
            <div className="relative h-full">
              {!activeToken && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-slate-300">
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
                    <Lock size={40} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2 text-slate-800">Access Restricted</h2>
                  <p className="text-slate-500 max-w-sm text-lg">No valid consent token found. Please request patient consent via the access panel.</p>
                </div>
              )}

              <div className={`space-y-6 ${!activeToken ? 'blur-md pointer-events-none grayscale' : ''}`}>
                <div className="bg-white p-8 rounded-3xl flex items-center justify-between border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Eye size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-800">Live Vitals Stream</h3>
                      <p className="text-sm text-slate-500">Patient: Saurav Aryal (42) | Device: DEV-001</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Token Expiry</div>
                    <div className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-mono font-bold">
                      <CountdownTimer expiryDate={activeToken?.expires_at} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <VitalsChart 
                    data={history} 
                    dataKey="hr" 
                    color="#00d4ff" 
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
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-6 flex items-center justify-between text-slate-800">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-blue-600" />
                      Medical Notes (Protected)
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-mono font-bold">
                      <ShieldCheck size={14} /> DECRYPTED_AES256
                    </div>
                  </h3>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-600 leading-relaxed font-mono">
                    <span className="text-blue-500/60">[TIMESTAMP: 2026-03-31T12:45Z]</span><br/>
                    <br/>
                    SUBJ: CARDIOVASCULAR_REPORT_ID_8829<br/>
                    <br/>
                    OBS: Patient exhibits stable rhythm (Sinus). Previous history of mild nocturnal arrhythmia. Current HR variance remains within 1.2% threshold. Access granted under "Emergency Review" protocol for immediate diagnostic validation. Data residency strictly ephemeral.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper for loading icon
const Loader2 = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default ClinicianDashboard;
