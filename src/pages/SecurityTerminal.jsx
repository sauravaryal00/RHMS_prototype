import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Terminal as TerminalIcon, 
  Activity, 
  Zap, 
  Lock, 
  Eye, 
  ChevronRight,
  Database,
  Crosshair,
  Wifi
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useRiskSentiment } from '../hooks/useRiskSentiment';
import { useThreatForecaster } from '../hooks/useThreatForecaster';

const SecurityTerminal = () => {
  const { sentiment, tickerData } = useRiskSentiment();
  const forecast = useThreatForecaster(sentiment.riskScore, sentiment.requestVelocity);
  const [activeTab, setActiveTab] = useState('LIVE_FEED');
  const scrollRef = useRef(null);

  // Auto-scroll the ticker feed
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [tickerData]);

  const stats = [
    { label: 'Risk Score', value: `${sentiment.riskScore}/100`, sub: 'Current Tension', color: sentiment.riskScore > 50 ? 'text-danger' : 'text-primary' },
    { label: 'Predicted Peak', value: `${forecast.predictedRisk}%`, sub: 'T+60s Forecast', color: forecast.predictedRisk > 60 ? 'text-warning' : 'text-primary' },
    { label: 'Breach Prob.', value: `${forecast.threatProbability}%`, sub: 'Heuristic Probability', color: forecast.threatProbability > 40 ? 'text-danger' : 'text-success' },
    { label: 'Request Velocity', value: `${sentiment.requestVelocity} RPM`, sub: 'Packet Rate', color: 'text-primary' },
  ];

  return (
    <div className="flex bg-background min-h-screen text-text-primary font-mono selection:bg-primary/30">
      <Sidebar role="admin" />
      
      <main className="flex-1 ml-64 p-4 lg:p-8 flex flex-col h-screen overflow-hidden">
        {/* Terminal Header */}
        <header className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                <TerminalIcon size={20} className="text-primary" />
             </div>
             <div>
                <h1 className="text-xl font-black tracking-widest uppercase">Deep_Analysis_Terminal_v4.2</h1>
                <div className="flex items-center gap-2 text-[10px] text-muted">
                   <span className="flex items-center gap-1"><Wifi size={10} className="text-success" /> CONNECTED_NODE_01</span>
                   <span className="w-1 h-1 rounded-full bg-white/20" />
                   <span>ENCRYPTION: AES-256-GCM</span>
                </div>
             </div>
          </div>
          <div className="flex gap-2">
            {['LIVE_FEED', 'RISK_ANALYSIS', 'POLICIES'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[10px] font-bold border transition-all ${
                  activeTab === tab 
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,212,255,0.2)]' 
                  : 'bg-white/5 border-white/10 text-muted hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* Top KPI Bar (Binance Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-surface border-l-2 border-primary/40 p-3 hover:bg-white/5 transition-all">
               <div className="text-[9px] text-muted font-bold uppercase tracking-tighter mb-1">{stat.label}</div>
               <div className={`text-xl font-black ${stat.color} leading-none mb-1`}>{stat.value}</div>
               <div className="text-[8px] text-muted italic">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
           {/* Left Column: Depth & Sentiment (4 cols) */}
           <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex-1 glass border border-white/5 p-4 flex flex-col">
                 <h3 className="text-[10px] font-bold uppercase text-muted mb-4 flex items-center gap-2">
                    <Crosshair size={12} className="text-danger" /> Risk Sentiment Index
                 </h3>
                 <div className="flex-1 flex flex-col justify-center items-center gap-6">
                    <div className="relative w-48 h-48">
                       <svg className="w-full h-full transform -rotate-90">
                          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                          <motion.circle 
                            cx="96" 
                            cy="96" 
                            r="80" 
                            stroke="currentColor" 
                            strokeWidth="12" 
                            fill="transparent" 
                            strokeDasharray="502.4" 
                            strokeDashoffset={502.4 - (502.4 * (sentiment.riskScore / 100))}
                            className={sentiment.riskScore > 50 ? 'text-danger' : 'text-primary'} 
                            initial={{ strokeDashoffset: 502.4 }}
                            animate={{ strokeDashoffset: 502.4 - (502.4 * (sentiment.riskScore / 100)) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-4xl font-black ${sentiment.riskScore > 50 ? 'text-danger' : 'text-primary'}`}>{sentiment.riskScore}%</span>
                          <span className="text-[9px] text-muted uppercase font-bold tracking-[0.2em]">Risk Tensor</span>
                       </div>
                    </div>
                    <div className="w-full space-y-3">
                       <div className="flex justify-between text-[10px]">
                          <span className="text-muted">VOLATILITY</span>
                          <span className="text-warning font-bold">{sentiment.volatility}σ</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-warning"
                            animate={{ width: `${Math.min(100, sentiment.volatility * 20)}%` }}
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="h-48 glass border border-white/5 p-4">
                 <h3 className="text-[10px] font-bold uppercase text-muted mb-4 flex items-center gap-2">
                    <Lock size={12} className="text-success" /> Active Policies
                 </h3>
                 <div className="space-y-2">
                    {['MFA_REQUIRED', 'ENCLAVE_ISOLATION', 'HMAC_VERIFY'].map(p => (
                      <div key={p} className="flex items-center justify-between text-[9px] p-2 bg-white/5 rounded border border-white/5">
                         <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> {p}</span>
                         <span className="text-success font-bold">ACTIVE</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Middle Column: Dynamic Content (8 cols) */}
           <div className="lg:col-span-8 glass border border-white/10 flex flex-col overflow-hidden bg-surface/50">
              {activeTab === 'LIVE_FEED' ? (
                <>
                  <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                     <div className="flex items-center gap-3">
                        <Activity size={14} className="text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live_Kernel_Audit_Stream</span>
                     </div>
                     <div className="text-[9px] font-mono text-muted">PACKETS_CAPTURED: {tickerData.length}</div>
                  </div>
                  
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[10px]">
                     <AnimatePresence mode="popLayout">
                        {tickerData.map((tick, i) => (
                          <motion.div 
                            key={`${tick.id}-${i}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-2 flex items-center gap-4 border-l-2 ${tick.status === 'TRUSTED' ? 'border-success bg-success/5' : 'border-danger bg-danger/5'} transition-all hover:bg-white/5`}
                          >
                             <span className="text-muted shrink-0">[{new Date(tick.timestamp).toLocaleTimeString()}]</span>
                             <span className={`font-bold shrink-0 w-24 ${tick.status === 'TRUSTED' ? 'text-success' : 'text-danger'}`}>{tick.status}</span>
                             <span className="text-primary shrink-0 uppercase w-32 truncate">{tick.type.replace('_', ' ')}</span>
                             <span className="text-muted font-mono truncate hidden md:block">HASH: {tick.hash}</span>
                             <ChevronRight size={10} className="text-muted ml-auto" />
                          </motion.div>
                        ))}
                     </AnimatePresence>
                     {tickerData.length === 0 && (
                       <div className="h-full flex flex-col items-center justify-center text-muted opacity-30 gap-4">
                          <TerminalIcon size={48} />
                          <span className="animate-pulse">WAITING_FOR_UPSTREAM_DATA...</span>
                       </div>
                     )}
                  </div>
                </>
              ) : activeTab === 'RISK_ANALYSIS' ? (
                <div className="flex-1 p-6 flex flex-col overflow-hidden">
                   <div className="flex justify-between items-center mb-8">
                      <div>
                         <h2 className="text-xl font-black text-primary">FORECAST_ENGINE_ALPHA</h2>
                         <p className="text-[10px] text-muted uppercase font-bold">Predictive Threat Assessment Mode</p>
                      </div>
                      <div className="p-3 bg-danger/10 border border-danger/30 rounded flex items-center gap-2">
                         <ShieldAlert size={16} className="text-danger animate-pulse" />
                         <span className="text-[10px] font-black text-danger">BREACH_PROB: {forecast.threatProbability}%</span>
                      </div>
                   </div>

                   {/* Forecasting Wave Visualization */}
                   <div className="flex-1 min-h-[200px] border border-white/5 bg-black/20 rounded-xl relative overflow-hidden flex items-end p-4 gap-1">
                      {forecast.forecastChartData.map((point, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                           <div className="w-full flex flex-col justify-end h-48 bg-white/5 relative group">
                              {point.actual !== null && (
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${point.actual}%` }}
                                  className="w-full bg-primary/60 border-t border-primary group-hover:bg-primary transition-all"
                                />
                              )}
                              {point.predicted !== null && (
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${point.predicted}%` }}
                                  className="w-full bg-warning/20 border-t border-dashed border-warning animate-pulse"
                                />
                              )}
                              <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 bg-white/5 flex items-center justify-center pointer-events-none">
                                 <span className="text-[8px] font-bold">{point.actual ?? Math.round(point.predicted)}%</span>
                              </div>
                           </div>
                           <span className="text-[8px] text-muted opacity-50">{point.predicted !== null ? `T+${(i - (forecast.forecastChartData.length - 5)) * 10}s` : ''}</span>
                        </div>
                      ))}
                      <div className="absolute top-4 left-4 flex gap-4 text-[9px] font-bold">
                         <div className="flex items-center gap-1 text-primary"><div className="w-2 h-2 bg-primary" /> REAL_TIME</div>
                         <div className="flex items-center gap-1 text-warning"><div className="w-2 h-2 border border-dashed border-warning" /> PROJECTED</div>
                      </div>
                   </div>

                   <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                      {forecast.insights.map((insight, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-lg flex items-start gap-4">
                           <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                             insight.type === 'CRITICAL' ? 'bg-danger/20 text-danger' : 
                             insight.type === 'WARNING' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                           }`}>
                              {insight.type === 'CRITICAL' ? <ShieldAlert size={16} /> : <Eye size={16} />}
                           </div>
                           <div>
                              <div className={`text-[10px] font-black mb-1 ${
                                insight.type === 'CRITICAL' ? 'text-danger' : 
                                insight.type === 'WARNING' ? 'text-warning' : 'text-primary'
                              }`}>{insight.type}_FORECAST</div>
                              <p className="text-xs text-muted leading-relaxed italic">"{insight.text}"</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted opacity-20">
                   <Lock size={64} />
                   <span className="text-xl font-black ml-4 tracking-[0.5em]">POLICIES_LOCKED</span>
                </div>
              )}

              {/* Terminal Bottom Controls */}
              <div className="p-4 border-t border-white/10 flex justify-between items-center bg-black/40">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                       <span className="text-[8px] font-bold text-success uppercase">System_Nominal</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <span className="text-[8px] text-muted font-mono uppercase">V4.2.1-PROTOTYPE-SAURAV</span>
                 </div>
                 <div className="flex gap-4">
                    <button className="text-[9px] text-muted hover:text-primary transition-all">EXPORT_JSON</button>
                    <button className="text-[9px] text-muted hover:text-danger transition-all">FLUSH_CACHE</button>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <style>{`
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.2);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default SecurityTerminal;
