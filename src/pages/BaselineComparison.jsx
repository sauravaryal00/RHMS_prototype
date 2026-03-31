import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  Globe, 
  Check, 
  X, 
  Zap,
  Activity
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSystemMetrics } from '../hooks/useSystemMetrics';

const BaselineComparison = () => {
  const { avgLatency, securityScore } = useSystemMetrics();
  const [activeMode, setActiveMode] = useState('consent');

  const modes = [
    { id: 'consent', name: 'Consent Token (Proposed)', icon: ShieldCheck, color: 'text-primary', borderColor: 'border-primary' },
    { id: 'baseline1', name: 'Password + OTP', icon: Lock, color: 'text-success', borderColor: 'border-success' },
    { id: 'baseline2', name: 'RBAC + Logging', icon: Users, color: 'text-warning', borderColor: 'border-warning' },
    { id: 'baseline3', name: 'Zero Trust Gateway', icon: Globe, color: 'text-danger', borderColor: 'border-danger' },
  ];

  const features = [
    { name: 'How Access is Granted', values: ['Patient-issued purpose-bound token', 'Username + Password + OTP', 'Role-based access', 'Short-lived session token'] },
    { name: 'Consent Card', values: [true, false, false, false] },
    { name: 'Revocation', values: ['Immediate, patient-controlled', 'Session timeout only', 'No revocation', 'Session expiry only'] },
    { name: 'Audit Log', values: ['Hash-chain tamper-evident', 'Standard', 'Standard', 'Standard'] },
    { name: 'Patient Control', values: ['Full real-time', 'None', 'None', 'None'] },
    { name: 'APP Compliance', values: ['Full (Compliant)', 'Partial', 'Partial', 'Partial'] },
  ];

  const metrics = [
    { label: 'Decision Latency (sec)', values: [avgLatency, 0.45, 0.15, 0.85] },
    { label: 'Security Score', values: [securityScore, 65, 40, 88] },
  ];

  return (
    <div className="flex bg-background min-h-screen text-text-primary font-outfit">
      <Sidebar role="admin" />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Baseline Comparison</h1>
          <p className="text-muted text-lg">Evaluating the academic novelty of Consent-as-Authentication against traditional industry standards.</p>
        </header>

        {/* Mode Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`p-6 rounded-3xl border-2 transition-all text-center relative overflow-hidden group ${
                activeMode === mode.id 
                ? `${mode.borderColor} bg-white/5 ring-4 ring-white/5` 
                : 'border-white/5 bg-white/5 hover:border-white/20'
              }`}
            >
              <mode.icon className={`w-8 h-8 mx-auto mb-3 ${activeMode === mode.id ? mode.color : 'text-muted'}`} />
              <div className={`text-xs font-bold ${activeMode === mode.id ? 'text-text-primary' : 'text-muted'}`}>{mode.name}</div>
              {activeMode === mode.id && (
                <div className={`absolute bottom-0 left-0 w-full h-1 ${mode.color.replace('text-', 'bg-')}`} />
              )}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="glass rounded-[2rem] overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="p-6 font-bold text-muted uppercase tracking-widest text-[10px] w-1/4">Feature / Attribute</th>
                  {modes.map(m => (
                    <th key={m.id} className={`p-6 font-bold text-center ${activeMode === m.id ? 'text-text-primary' : 'text-muted opacity-50'}`}>
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-6 font-bold text-sm text-text-primary/70">{feature.name}</td>
                    {feature.values.map((val, idx) => (
                      <td key={idx} className={`p-6 text-center text-sm ${activeMode === modes[idx].id ? 'font-medium' : 'text-muted opacity-50'}`}>
                        {typeof val === 'boolean' ? (
                          val ? <Check className="mx-auto text-success" /> : <X className="mx-auto text-danger" />
                        ) : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparative Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {metrics.map((metric, i) => (
            <div key={i} className="glass p-8 rounded-[2rem]">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Zap className="text-primary" size={20} />
                {metric.label}
              </h3>
              <div className="space-y-6">
                {modes.map((mode, idx) => (
                  <div key={mode.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className={activeMode === mode.id ? 'text-text-primary' : 'text-muted opacity-50'}>{mode.name}</span>
                      <span className={activeMode === mode.id ? 'text-primary' : 'text-muted'}>{metric.values[idx]}</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(metric.values[idx] / (i === 0 ? 10 : 100)) * 100}%` }}
                        className={`h-full ${activeMode === mode.id ? mode.color.replace('text-', 'bg-') : 'bg-muted opacity-30'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BaselineComparison;
