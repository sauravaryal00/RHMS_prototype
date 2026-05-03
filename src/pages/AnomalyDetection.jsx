import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, 
  Globe, Smartphone, Clock, Database, HeartPulse, 
  UserX, Terminal as TerminalIcon, CheckCircle, Activity,
  Network, Cpu, Lock, Key, Power, X, Trash2, ListFilter,
  ShieldHalf, Database as DatabaseIcon, ShieldCheck as ShieldIcon
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

// Safe Icon Mapper
const getIconForType = (type) => {
  switch(type) {
    case 'auth_brute': return UserX;
    case 'geo_anomaly': return Globe;
    case 'token_replay': return Clock;
    case 'scope_creep': return Database;
    case 'device_anomaly': return Smartphone;
    case 'clinical_spike': return HeartPulse;
    default: return Activity;
  }
};

// ----------------------------------------------------------------------
// SECURITY BLACKLIST MODAL
// ----------------------------------------------------------------------
const SecurityBlacklistModal = ({ bannedList, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-5xl bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]"
      >
        <div className="px-8 py-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
              <DatabaseIcon size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Security Blacklist</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Intercepted Signatures: {bannedList.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-all hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          {bannedList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-24">
              <ShieldIcon size={64} className="opacity-10 mb-4" />
              <p className="font-black text-sm uppercase tracking-widest">Database Empty</p>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                  <th className="pb-3 pl-4 text-center">Sig</th>
                  <th className="pb-3">Threat Type</th>
                  <th className="pb-3">Hardware / Network ID</th>
                  <th className="pb-3">Risk</th>
                  <th className="pb-3 text-right pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {bannedList.map((item, idx) => (
                  <tr key={idx} className="bg-white group hover:shadow-sm transition-all border border-slate-100 rounded-xl overflow-hidden">
                    <td className="py-4 pl-4 rounded-l-xl">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.resolution === 'JA3_BLACKLISTED' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        {item.resolution === 'JA3_BLACKLISTED' ? <Lock size={14} /> : <Globe size={14} />}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="font-black text-slate-800 uppercase text-[11px] tracking-tight">{item.name}</span>
                    </td>
                    <td className="py-4">
                      <code className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded font-bold border border-slate-100">
                        {item.resolution === 'JA3_BLACKLISTED' ? item.ja3_hash.substring(0,24) + '...' : item.ip}
                      </code>
                    </td>
                    <td className="py-4 font-black font-mono text-red-500 text-xs">{item.dynamicRisk}</td>
                    <td className="py-4 pr-4 text-right rounded-r-xl">
                      <span className="bg-red-50 text-red-600 text-[9px] font-black px-3 py-1 rounded-lg uppercase border border-red-100 tracking-tighter">Banned</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black transition-all">
            Close Registry
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// STATIC TERMINAL MODAL
// ----------------------------------------------------------------------
const LiveTerminalModal = ({ template, onComplete, onCancel }) => {
  const [terminalPhase, setTerminalPhase] = useState('executing'); 
  const [visibleLogs, setVisibleLogs] = useState([]);

  useEffect(() => {
    // Reset and clear terminal at start
    setVisibleLogs([]);
    setTerminalPhase('executing');

    let logs = [];
    if (template.type === 'auth_brute') {
      logs = [
        `[SYSTEM] Reseting terminal session...`,
        `[SYSTEM] Connection established with attacker-node-v4`,
        `root@attacker-node:~# ${template.suggestedCommand}`,
        " ",
        "[+] Starting Hydra Dictionary Attack against rhms-gateway...",
        "[+] Loading wordlist: /wordlists/rockyou.txt (14,344,391 words)",
        "[Attempt 1] Testing: password123 ... FAILED",
        "[Attempt 2] Testing: admin ... FAILED",
        "[Attempt 3] Testing: qwerty ... FAILED",
        "[Attempt 4] Testing: 12345678 ... FAILED",
        "[Attempt 5] Testing: dr_sharma ... FAILED",
        "[Attempt 6] Testing: hospital ... FAILED",
        "[Attempt 7] Testing: letmein ... FAILED",
        "[Attempt 8] Testing: security ... FAILED"
      ];
    } else {
      logs = [
        `[SYSTEM] Clearing previous logs...`,
        `[SYSTEM] Allocating buffer for new payload...`,
        `root@attacker-node:~# ${template.suggestedCommand}`,
        " ",
        `[+] Executing payload vector: ${template.name}`,
        `[+] Target: rhms-gateway (Zero-Trust Endpoint)`,
        `[+] Injecting malicious payload...`,
        `[+] Awaiting response from server...`
      ];
    }

    // Line-by-line typing simulation
    logs.forEach((line, idx) => {
      setTimeout(() => {
        setVisibleLogs(prev => [...prev, line]);
      }, idx * 100);
    });

    const timer1 = setTimeout(() => {
      setTerminalPhase('intercepted');
    }, logs.length * 100 + 500);

    const timer2 = setTimeout(() => {
      onComplete(template);
    }, logs.length * 100 + 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [template, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20 }}
        className={`w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border-2 transition-colors duration-300 flex flex-col ${
          terminalPhase === 'intercepted' ? 'border-red-500 bg-red-950' : 'border-slate-700 bg-black'
        }`}
      >
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <button onClick={onCancel} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-mono text-slate-400 font-bold">root@attacker-node:~ (Simulation Mode)</div>
          </div>
        </div>
        
        <div className="p-6 font-mono text-sm h-96 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="text-emerald-400 mb-6 border-b border-emerald-900/30 pb-2">
            KALI LINUX TERMINAL v2.4<br/>
            SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}
          </div>
          
          {visibleLogs.map((line, idx) => (
            <div key={idx} className="mb-2 text-emerald-400">
              {line}
            </div>
          ))}
          
          {terminalPhase === 'intercepted' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-4 border-2 border-red-500 bg-red-500/10 rounded-xl">
              <div className="text-red-500 font-black text-lg mb-2 flex items-center gap-2">
                <ShieldAlert size={20} /> [POLICY GATEWAY] CRITICAL ANOMALY DETECTED!
              </div>
              <div className="text-red-500 font-black text-lg">⛔ [ZERO-TRUST] CONNECTION TERMINATED. IP BLACKLISTED.</div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// ----------------------------------------------------------------------
const AnomalyDetection = () => {
  const [activeQueue, setActiveQueue] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [resolvedThreats, setResolvedThreats] = useState([]);
  const [simulatingThreat, setSimulatingThreat] = useState(null);
  const [isGatewayActive, setIsGatewayActive] = useState(false);
  const [showBlacklist, setShowBlacklist] = useState(false);

  const triggerTemplates = [
    { id: 't1', category: 'Behavioral', name: 'Brute Force Login', baseRisk: 8.5, type: 'auth_brute', suggestedCommand: './hydra -l dr_sharma -P /wordlists/rockyou.txt ssh://rhms-gateway' },
    { id: 't2', category: 'Spatial', name: 'Foreign IP Access', baseRisk: 9.1, type: 'geo_anomaly', suggestedCommand: 'proxychains4 curl -X POST https://rhms-api/login' },
    { id: 't3', category: 'Temporal', name: 'Expired Token Replay', baseRisk: 7.8, type: 'token_replay', suggestedCommand: 'curl -H "Authorization: Bearer $EXPIRED_JWT" https://rhms-api/vitals' },
    { id: 't4', category: 'Contextual', name: 'Scope Creep', baseRisk: 8.9, type: 'scope_creep', suggestedCommand: 'python3 exploit_scope.py --target patient-42 --fetch psych_notes' },
    { id: 't5', category: 'Contextual', name: 'Unregistered Device', baseRisk: 7.2, type: 'device_anomaly', suggestedCommand: 'curl -A "Mobile Safari (iPad)" https://rhms-api/dashboard' },
    { id: 't6', category: 'Clinical', name: 'Cardiac Arrest Spike', baseRisk: 9.9, type: 'clinical_spike', suggestedCommand: './inject_sensor_data.sh --patient 42 --hr 168' }
  ];

  const generateDynamicPayload = (template) => {
    const randomHex = (len) => Array.from({length: len}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const locations = [
      { ip: '185.15.22.1', loc: 'Moscow, RU', asn: 'AS12389 Rostelecom', tor: true },
      { ip: '103.22.201.25', loc: 'Beijing, CN', asn: 'AS4808 China Unicom', tor: false },
      { ip: '45.33.2.145', loc: 'Ashburn, VA, USA', asn: 'AS63949 Linode', tor: false },
      { ip: '194.187.249.12', loc: 'Frankfurt, DE', asn: 'AS34305 Digital Ocean', tor: false },
      { ip: '111.90.150.2', loc: 'Kuala Lumpur, MY', asn: 'AS45839 Shinjiru Technology', tor: true }
    ];
    const targetLoc = locations[Math.floor(Math.random() * locations.length)];
    let ip = targetLoc.ip; let loc = targetLoc.loc; let asn = targetLoc.asn; let torNode = targetLoc.tor; let payload = '';
    
    if (template.type === 'clinical_spike') {
      ip = '10.0.42.168'; loc = 'Hospital Ward 4 (LAN)'; asn = 'Intranet IoT Node'; torNode = false;
      payload = `{"hr": ${Math.floor(Math.random()*20 + 160)}, "bp": "180/110", "spo2": 88, "temp": 102.4, "resp": 28, "glucose": 185}`;
    } else {
      payload = `{"action": "${template.name}", "type": "exploit_attempt"}`;
    }

    return {
      id_instance: `TRG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: template.name, type: template.type, category: template.category,
      timestamp: new Date().toISOString(),
      dynamicRisk: (template.baseRisk + (Math.random() * 0.4 - 0.2)).toFixed(1),
      ip, loc, asn, torNode, latency: Math.floor(Math.random() * 200 + 20),
      mac: "XX:XX:XX:XX:XX:XX".replace(/X/g, () => "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16))),
      os: template.type === 'device_anomaly' ? 'iOS 15.2' : 'Windows 11',
      browser: template.type === 'device_anomaly' ? 'Mobile Safari' : 'Chrome 119',
      webgl_renderer: template.type === 'device_anomaly' ? 'Apple A15 GPU' : 'NVIDIA RTX 3080',
      screen_res: '2560x1440', color_depth: '24-bit', mouse_entropy: '0.98 (Bot-Like)',
      ja3_hash: randomHex(32), tls_version: 'TLS 1.3', cipher_suite: 'TLS_AES_128_GCM',
      mockHeaders: { 'User-Agent': 'Mozilla/5.0...', 'Authorization': 'Bearer eyJhb...' },
      rawPayload: payload
    };
  };

  const handleTerminalComplete = (template) => {
     const newThreat = generateDynamicPayload(template);
     setActiveQueue(prev => [newThreat, ...prev]);
     if (!selectedThreat) setSelectedThreat(newThreat);
     setSimulatingThreat(null);
  };

  const handleResolve = (action) => {
    if (!selectedThreat) return;
    const resolved = { ...selectedThreat, resolution: action, resolvedAt: new Date().toISOString() };
    setResolvedThreats(prev => [resolved, ...prev]);
    setActiveQueue(prev => prev.filter(t => t.id_instance !== selectedThreat.id_instance));
    setSelectedThreat(null);
  };

  // --- NEW: REAL-TIME DATABASE LISTENER (For Real Terminal Attacks) ---
  useEffect(() => {
    import('../utils/supabaseClient').then(({ supabase }) => {
      if (!supabase) return;

      const channel = supabase
        .channel('real-terminal-attacks')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'security_incidents' 
        }, (payload) => {
          const raw = payload.new;
          // Transform database format to UI format
          const externalThreat = {
            id_instance: `REAL-${raw.id}`,
            name: raw.threat_name,
            type: raw.threat_type,
            category: 'External (Terminal)',
            timestamp: raw.created_at,
            dynamicRisk: raw.risk_score,
            ip: raw.source_ip,
            loc: 'Remote Access (Terminal)',
            asn: 'Unknown External ASN',
            ja3_hash: raw.ja3_hash,
            rawPayload: JSON.stringify(raw.payload),
            torNode: false,
            latency: 42,
            mac: '00:00:00:00:00:00',
            os: 'Linux (Terminal)',
            browser: 'Python/Request-Agent'
          };
          
          setActiveQueue(prev => [externalThreat, ...prev]);
          setSelectedThreat(externalThreat); // Auto-focus on real attack
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 relative">
      <Sidebar role="admin" />
      
      <main className="flex-1 ml-64 p-8 max-w-7xl mx-auto flex flex-col h-screen overflow-hidden">
        
        {/* REFINED SLEEK HEADER */}
        <header className="mb-8 flex justify-between items-center shrink-0 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl text-red-500 shadow-lg">
              <ShieldHalf size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                Zero-Trust <span className="text-red-500">Interceptor</span>
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Advanced SOC Workbench</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* SLEEK BLACKLIST BUTTON */}
            <button 
              onClick={() => setShowBlacklist(true)}
              className="flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-md group border border-slate-700"
            >
              <DatabaseIcon size={18} className="text-red-500" />
              <div className="text-left">
                <div className="text-[10px] font-black uppercase tracking-widest leading-none">Blacklist</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{resolvedThreats.length} Banned</div>
              </div>
            </button>

            <div className="h-10 w-[1px] bg-slate-100" />

            {/* SLEEK COMPACT TOGGLE */}
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Gateway</div>
              <button 
                onClick={() => setIsGatewayActive(!isGatewayActive)}
                className={`relative inline-flex h-9 w-20 items-center rounded-xl transition-all duration-300 ${
                  isGatewayActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-7 w-7 transform rounded-lg bg-white shadow-md transition-all duration-300 ease-in-out flex items-center justify-center ${
                  isGatewayActive ? 'translate-x-12' : 'translate-x-1'
                }`}>
                  <Power size={14} className={isGatewayActive ? 'text-emerald-500' : 'text-slate-400'} />
                </span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6 pb-12">
          
          {/* SIMULATION GRID */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative min-h-[180px]">
            <AnimatePresence>
              {!isGatewayActive && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-3xl"
                >
                  <ShieldIcon size={32} className="text-slate-300 mb-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Gateway Offline | Simulations Locked</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <TerminalIcon className="text-red-500" size={16}/> Security Attack Vectors
              </h2>
              {isGatewayActive && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">System Armed</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
              {triggerTemplates.map(t => {
                const IconComponent = getIconForType(t.type);
                return (
                  <button
                    key={t.id} 
                    onClick={() => setSimulatingThreat(t)}
                    disabled={simulatingThreat !== null || !isGatewayActive}
                    className="p-4 rounded-2xl border border-slate-100 bg-white hover:bg-red-50 hover:border-red-200 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-red-100 transition-all group-hover:scale-110">
                      <IconComponent size={20} className="text-slate-400 group-hover:text-red-600" />
                    </div>
                    <div className="text-[10px] font-black text-slate-700 leading-tight tracking-tight uppercase group-hover:text-red-700">{t.name}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* MIDDLE ROW */}
          <section className="flex gap-6 h-72 shrink-0">
            <div className="w-1/2 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={14} /> Active Interceptions
                </h3>
                <span className="bg-red-500 text-white font-black px-2 py-0.5 rounded-lg text-[9px] uppercase">{activeQueue.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                <AnimatePresence>
                  {activeQueue.length === 0 && (
                    <div className="h-full flex items-center justify-center text-slate-300 font-black text-[10px] uppercase tracking-widest">Safe</div>
                  )}
                  {activeQueue.map((threat) => {
                    const ThreatIcon = getIconForType(threat.type);
                    return (
                      <motion.button
                        key={threat.id_instance}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedThreat(threat)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                          selectedThreat?.id_instance === threat.id_instance 
                          ? 'bg-slate-900 border-slate-800 text-white shadow-lg' 
                          : 'bg-white border-slate-100 hover:border-red-100 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-black text-[11px] uppercase flex items-center gap-2">
                            <ThreatIcon size={14} className="text-red-500" /> {threat.name}
                          </div>
                          <div className="text-[9px] font-black font-mono text-red-500">CVSS {threat.dynamicRisk}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            <div className="w-1/2 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <CheckCircle className="text-emerald-500" size={14} /> Audit Log
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar text-[10px]">
                <table className="w-full text-left">
                  <thead className="bg-white border-b border-slate-50 text-slate-400 font-black uppercase">
                    <tr><th className="px-6 py-3">Signature ID</th><th className="px-6 py-3">Vector</th><th className="px-6 py-3">Mitigation</th></tr>
                  </thead>
                  <tbody>
                    {resolvedThreats.map((rt, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-6 py-3 font-mono font-bold">{rt.id_instance}</td>
                        <td className="px-6 py-3 font-black">{rt.name}</td>
                        <td className="px-6 py-3">
                          <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg border border-red-100 font-black uppercase text-[8px]">{rt.resolution.replace('_', ' ')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* LARGE BOTTOM FORENSIC SECTION */}
          <section className="bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800 flex flex-col min-h-[500px]">
            {selectedThreat ? (
              <>
                <div className="bg-slate-950 px-8 py-6 flex justify-between items-center border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                      <ShieldAlert size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Forensic Deep-Analysis</h2>
                      <div className="text-[10px] font-black text-slate-500 font-mono tracking-widest mt-1 uppercase">INSTANCE: {selectedThreat.id_instance}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black font-mono text-red-500">{selectedThreat.dynamicRisk}</div>
                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Risk Level</div>
                  </div>
                </div>

                <div className="flex-1 p-8 grid grid-cols-4 gap-6">
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Network size={14} className="text-blue-500" /> Network Intelligence
                    </div>
                    <div className="font-mono space-y-4 text-[11px] flex-1">
                      <div><div className="text-slate-600 text-[8px] uppercase font-black">Source IP</div><div className="text-blue-400 font-bold">{selectedThreat.ip}</div></div>
                      <div><div className="text-slate-600 text-[8px] uppercase font-black">ASN Route</div><div className="text-emerald-400 leading-tight">{selectedThreat.asn}</div></div>
                      <div><div className="text-slate-600 text-[8px] uppercase font-black">Origin</div><div className="text-slate-300 font-bold">{selectedThreat.loc}</div></div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Cpu size={14} className="text-purple-500" /> Hardware Telemetry
                    </div>
                    <div className="font-mono space-y-4 text-[11px] flex-1">
                      <div><div className="text-slate-600 text-[8px] uppercase font-black">OS Context</div><div className="text-white font-bold">{selectedThreat.os}</div></div>
                      <div><div className="text-slate-600 text-[8px] uppercase font-black">Hardware MAC</div><div className="text-slate-400 font-bold">{selectedThreat.mac}</div></div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/50">
                        <div className="text-slate-500 text-[8px] font-black mb-1 uppercase">WebGL Renderer</div>
                        <div className="text-amber-500 text-[9px] font-bold">{selectedThreat.webgl_renderer}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Lock size={14} className="text-red-500" /> Crypto Profile
                    </div>
                    <div className="font-mono space-y-4 text-[11px] flex-1">
                      <div>
                        <div className="text-slate-600 text-[8px] uppercase font-black mb-1">JA3 TLS Fingerprint</div>
                        <div className="text-red-400 bg-red-950/20 p-3 rounded-lg border border-red-900/30 break-all text-[9px] font-bold leading-relaxed">{selectedThreat.ja3_hash}</div>
                      </div>
                      <div><div className="text-slate-600 text-[8px] uppercase font-black">Entropy Analysis</div><div className="text-purple-400 font-bold">{selectedThreat.mouse_entropy}</div></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <TerminalIcon size={14} className="text-emerald-500" /> Scraped Payload
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[9px] space-y-2">
                      <div className="text-slate-500 uppercase font-black text-[8px]">JSON Body Decrypted</div>
                      <div className="text-amber-400 bg-slate-900 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">{selectedThreat.rawPayload}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-8 flex gap-4 border-t border-slate-800 shrink-0 items-center justify-center">
                  <button onClick={() => handleResolve('IP_BLOCKED')} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl border border-slate-700 transition-all text-[10px] uppercase tracking-widest">
                    Block ASN / IP Range
                  </button>
                  <button onClick={() => handleResolve('JA3_BLACKLISTED')} className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl border border-red-500 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/10">
                    Blacklist Device Hash
                  </button>
                  <button onClick={() => handleResolve('ACCOUNT_FROZEN')} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl border border-slate-700 transition-all text-[10px] uppercase tracking-widest">
                    Revoke Auth Token
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-700 min-h-[500px]">
                <ShieldIcon size={80} className="text-emerald-500 opacity-10 mb-6" />
                <p className="font-black tracking-[0.3em] uppercase text-2xl text-slate-800">Forensic Bay Idle</p>
              </div>
            )}
          </section>

        </div>
      </main>

      <AnimatePresence>
        {simulatingThreat && (
          <LiveTerminalModal template={simulatingThreat} onComplete={handleTerminalComplete} onCancel={() => setSimulatingThreat(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBlacklist && (
          <SecurityBlacklistModal bannedList={resolvedThreats} onClose={() => setShowBlacklist(false)} />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AnomalyDetection;
