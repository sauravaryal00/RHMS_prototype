import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Shield, Lock, User, Activity, AlertCircle, Key, Mail, CheckCircle2 } from 'lucide-react'
import { roles, authModes } from '../utils/mockData'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import emailjs from '@emailjs/browser'

const LoginPage = () => {
  const { role: urlRole } = useParams();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(urlRole || 'admin')
  const [authMethod, setAuthMethod] = useState('mfa') 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [generatedOtp, setGeneratedOtp] = useState(''); 
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, authMessage, setAuthMessage } = useAuth()

  useEffect(() => {
    // Check for message in navigation state (from ProtectedRoute)
    if (location.state?.message) {
      setAuthMessage(location.state.message);
    }
    
    // Update selected role if URL parameter changes
    if (urlRole) {
      setSelectedRole(urlRole);
    }

    return () => setAuthMessage('');
  }, [location.state, urlRole]);

  // --- EMAILJS CONFIG ---
  const SERVICE_ID = "service_qiz4qnd"; 
  const TEMPLATE_ID = "template_7j39999";
  const PUBLIC_KEY = "user_xxxxxxxxx";

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let success = false;
    if (supabase) {
      const { data } = await supabase.from('profiles').select('*').eq('email', email).eq('password', password).eq('role', selectedRole).single()
      if (data) success = true;
    } else {
      if (password === `${selectedRole}123`) success = true;
    }

    if (success) {
      if (authMethod === 'standard') {
        login({ email, role: selectedRole });
        navigate(`/${selectedRole}`);
      } else {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        try {
          await emailjs.send(SERVICE_ID, TEMPLATE_ID, { to_name: "Saurav", to_email: "sauravaryal1122@gmail.com", otp_code: newOtp }, PUBLIC_KEY);
          setStep(2);
        } catch (err) {
          setError("Email Service Error. Using Master OTP 123456.");
          setStep(2); 
        }
      }
      setLoading(false);
    } else {
      setError('Invalid credentials.');
      setLoading(false);
    }
  }

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleMfaSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const enteredOtp = otp.join('');
    
    // Check against generated OTP or a backup master code
    if (enteredOtp === generatedOtp || enteredOtp === '123456') {
      login({ email, role: selectedRole });
      if (selectedRole === 'admin') navigate('/admin')
      else if (selectedRole === 'patient') navigate('/patient')
      else if (selectedRole === 'clinician') navigate('/clinician')
      else if (selectedRole === 'caregiver') navigate('/caregiver')
    } else {
      setError('Invalid OTP code. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex bg-[#0a0f1d] overflow-hidden font-outfit">
      
      <div className="flex w-full h-screen">
        
        {/* LEFT SECTION: IMMERSIVE BRANDING & MODE SELECTION */}
        <div className="relative hidden lg:flex lg:w-[40%] h-full bg-slate-900 border-r border-white/5 flex-col justify-between p-12 overflow-hidden">
          {/* Background Abstract Shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-emerald-600/20 blur-[120px] rounded-full" />
          </div>

          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-16"
            >
              <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                <Shield size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">RHMS</h1>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1">Security Node v4.0</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            >
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Access Methodology</h2>
              <div className="space-y-5">
                {[
                  { id: 'standard', name: 'Standard Login', desc: 'Baseline Auth Protocol', icon: User, color: 'blue' },
                  { id: 'mfa', name: 'Zero-Trust MFA', desc: 'Secure Real-time Verification', icon: Lock, color: 'emerald' }
                ].map((mode) => (
                  <button 
                    key={mode.id}
                    onClick={() => {setAuthMethod(mode.id); setStep(1)}}
                    className={`w-full p-6 rounded-[2rem] border-2 transition-all text-left flex items-center gap-5 group ${
                      authMethod === mode.id 
                      ? `border-${mode.color}-500 bg-${mode.color}-500/10 shadow-2xl` 
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl transition-all ${
                      authMethod === mode.id ? `bg-${mode.color}-500 text-white scale-110 shadow-lg` : 'bg-slate-800 text-slate-500'
                    }`}>
                      <mode.icon size={24} />
                    </div>
                    <div>
                      <div className="text-md font-black text-white uppercase tracking-tight">{mode.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">{mode.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="relative z-10 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-md"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Security Policy Active</span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase leading-relaxed tracking-wider">
              Protected by military-grade AES-256 encryption. All authorization attempts are monitored by the Zero-Trust Anomaly Engine.
            </p>
          </motion.div>
        </div>

        {/* RIGHT SECTION: CLEAN AUTHENTICATION FORM */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 lg:p-24 relative overflow-hidden">
          
          {/* Decorative Elements for Mobile/Tablet */}
          <div className="lg:hidden absolute top-12 left-12 flex items-center gap-3">
             <Shield size={24} className="text-blue-600" />
             <h1 className="text-lg font-black text-slate-900 uppercase">RHMS</h1>
          </div>

          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  className="w-full"
                >
                  {authMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="mb-8 p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700 shadow-sm"
                    >
                      <AlertCircle size={20} />
                      <span className="text-[11px] font-black uppercase tracking-widest">{authMessage}</span>
                    </motion.div>
                  )}
                  
                  <div className="mb-12">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none mb-3">Welcome Back</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Please verify your organizational identity</p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-8">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {roles.map((role) => (
                        <button
                          type="button" key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-5 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-3 ${
                            selectedRole === role.id ? 'border-blue-500 bg-blue-50' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-3xl">{role.icon}</span>
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">{role.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-5">
                      <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="Corporate Email Address" 
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:border-blue-500 transition-all font-semibold text-slate-800"
                        />
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="Secure Password" 
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:border-blue-500 transition-all font-semibold text-slate-800"
                        />
                      </div>
                      {error && <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center py-2 px-4 bg-red-50 rounded-lg border border-red-100">{error}</motion.div>}
                    </div>

                    <button 
                      type="submit" disabled={loading}
                      className={`w-full py-6 rounded-[1.5rem] font-black transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 text-white text-sm tracking-widest uppercase ${
                        authMethod === 'mfa' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                      }`}
                    >
                      {loading ? 'Authenticating...' : (authMethod === 'mfa' ? 'Secure Login via MFA' : 'Dashboard Entrance')}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  className="w-full"
                >
                  <div className="mb-12 text-center lg:text-left">
                    <div className="inline-flex p-5 bg-emerald-50 rounded-[1.5rem] text-emerald-600 mb-6">
                      <Key size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none mb-3">Identity Check</h2>
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-4 leading-loose">
                      We've dispatched a unique security code to<br/>
                      <span className="text-emerald-600 font-black text-xs underline">sauravaryal1122@gmail.com</span>
                    </p>
                  </div>

                  <form onSubmit={handleMfaSubmit} className="space-y-10">
                    <div className="flex justify-between gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index} id={`otp-${index}`}
                          type="text" maxLength="1" value={digit}
                          onChange={(e) => {
                            if (isNaN(e.target.value)) return;
                            const newOtp = [...otp];
                            newOtp[index] = e.target.value.substring(e.target.value.length - 1);
                            setOtp(newOtp);
                            if (e.target.value && index < 5) document.getElementById(`otp-${index+1}`).focus();
                          }}
                          className="w-full h-20 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-3xl font-black text-emerald-600 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                        />
                      ))}
                    </div>

                    <div className="space-y-5">
                      {error && <div className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center py-2 px-4 bg-red-50 rounded-lg border border-red-100 animate-shake">{error}</div>}
                      <button 
                        type="submit" disabled={loading}
                        className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[1.5rem] transition-all shadow-2xl shadow-slate-900/30 uppercase tracking-widest text-sm"
                      >
                        {loading ? 'Verifying...' : 'Validate & Authorize'}
                      </button>
                      <button 
                        type="button" onClick={() => setStep(1)}
                        className="w-full text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-blue-600 transition-colors"
                      >
                        Try alternative login
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  )
}

export default LoginPage
