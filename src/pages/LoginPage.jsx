import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, User, Activity, AlertCircle } from 'lucide-react'
import { roles, authModes } from '../utils/mockData'

import { supabase } from '../utils/supabaseClient'

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('patient')
  const [selectedMode, setSelectedMode] = useState('consent')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Try Supabase Auth (or profile check for demo)
    if (supabase) {
      const { data, error: authError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .eq('role', selectedRole)
        .single()

      if (data) {
        // Success
        if (selectedRole === 'admin') navigate('/admin')
        else if (selectedRole === 'patient') navigate('/patient')
        else if (selectedRole === 'clinician') navigate('/clinician')
        else if (selectedRole === 'caregiver') navigate('/caregiver')
      } else {
        setError('Invalid credentials for selected role.')
      }
    } else {
      // 2. Mock Fallback if Supabase not connected
      if (password === `${selectedRole}123`) {
        if (selectedRole === 'admin') navigate('/admin')
        else if (selectedRole === 'patient') navigate('/patient')
        else if (selectedRole === 'clinician') navigate('/clinician')
        else if (selectedRole === 'caregiver') navigate('/caregiver')
      } else {
        setError('Try: ' + selectedRole + '@rhms.com / ' + selectedRole + '123')
      }
    }
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Flow */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="data-dot" 
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }} 
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl glass p-8 rounded-3xl"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary/10 border border-primary/20 p-4"
          >
            <Shield className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold font-outfit text-text-primary mb-2">RHMS Dashboard</h1>
          <p className="text-muted">Consent-as-Authentication Prototype</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mode Selector */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Authentication Mode
            </h2>
            <div className="space-y-3">
              {authModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedMode === mode.id 
                    ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mode.icon}</span>
                    <div>
                      <div className="font-semibold text-text-primary">{mode.name}</div>
                      <div className="text-xs text-muted">{mode.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Role Selection
            </h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-xl border transition-all text-center ${
                      selectedRole === role.id 
                      ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">{role.icon}</div>
                    <div className="text-sm font-medium">{role.name}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {error && <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-xs rounded-lg text-center animate-shake">{error}</div>}
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (e.g., patient@rhms.com)" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-background font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Access Dashboard'}
              </button>
              
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-[10px] space-y-2">
                <div className="font-bold text-primary uppercase tracking-widest">Demo Credentials</div>
                <div className="text-muted">Use the following for testing (select the matching role first):</div>
                <div className="grid grid-cols-1 gap-1 text-text-primary/70">
                  <div>Patient: <span className="text-primary">patient@rhms.com / patient123</span></div>
                  <div>Admin: <span className="text-primary">admin@rhms.com / admin123</span></div>
                  <div>Clinician: <span className="text-primary">clinician@rhms.com / clinician123</span></div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>Note: In 'Consent Token' mode, your role determines which dashboard view you control.</p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
