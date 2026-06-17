import React, { useState } from "react";
import {
  Shield,
  Activity,
  Grid2X2,
  Server,
  AlertTriangle,
  Router,
  Monitor,
  Ban,
  ClipboardList,
  FileText,
  Settings,
  User,
  Stethoscope,
  Target,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Fingerprint,
  Globe,
  Zap,
} from "lucide-react";
import Sidebar from '../components/Sidebar';

const ATTACKER_PROFILES = [
  { ip: "185.xxx.xxx.xxx", mac: "a4f2c9b7e3d44b16", device: "Unknown Chrome/Linux", loc: "Foreign network" }, // Exact match from screenshot
  { ip: "103.22.201.25", mac: "001a2b3c4d5e", device: "Python Requests/2.31.0", loc: "Beijing, China" },
  { ip: "45.134.144.19", mac: "88e9fe4a2c11", device: "Kali Linux / Curl", loc: "Frankfurt, Germany (VPN)" },
  { ip: "194.26.29.111", mac: "123456789abc", device: "Proxychains 4.0", loc: "St. Petersburg, Russia" },
  { ip: "89.248.165.1", mac: "5ce0c5ab3f21", device: "Mozilla/5.0 (Windows NT 10.0)", loc: "Amsterdam, Netherlands" }
];

export default function SecurityMonitoringDashboard() {
  // Pick a random attacker profile ONCE when the dashboard loads
  const [activeProfile] = useState(() => ATTACKER_PROFILES[Math.floor(Math.random() * ATTACKER_PROFILES.length)]);

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans">
      {/* Global White Sidebar */}
      <Sidebar role="admin" />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        {/* Header */}
        <header className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold">
              RHMS Security Monitoring Dashboard
            </h2>
            <p className="text-slate-400 mt-1">
              Post-Approval Security Interception Console
            </p>
          </div>

          <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-semibold text-red-600">LIVE INTERCEPTION</span>
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm text-slate-700 font-medium">
            <Settings size={18} /> Configure Policies
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <DashboardCard number="01" title="Risk Overview">
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="w-48 h-48 rounded-full border-4 border-slate-200 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-[12px] border-red-500 border-t-transparent border-r-transparent rotate-45 opacity-80" />
                <div className="text-center z-10 bg-white rounded-full w-36 h-36 flex flex-col items-center justify-center shadow-lg border border-slate-100">
                  <span className="text-5xl font-black text-red-500">8.6</span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Critical</span>
                </div>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <RiskFactor icon={<Target />} label="Geolocation Mismatch" score="+3.2" />
              <RiskFactor icon={<Shield />} label="Missing Device Trust" score="+2.8" />
              <RiskFactor icon={<Activity />} label="Unusual Behavior" score="+1.5" />
            </div>
          </DashboardCard>

          <DashboardCard number="02" title="Audit Event Timeline">
            <div className="flex flex-col h-full overflow-hidden mt-4">
              <TimelineEvent
                time="14:02:11"
                title="Session Approved"
                desc="Valid clinical parameters detected."
                status="success"
              />
              <TimelineEvent
                time="14:03:45"
                title="Token Replayed"
                desc="Same token used from new IP."
                status="warning"
              />
              <TimelineEvent
                time="14:03:46"
                title="Anomaly Detected"
                desc="Zero Trust validation failed."
                status="danger"
                last
              />
            </div>
          </DashboardCard>

          <DashboardCard number="03" title="Policy Gateway Decision">
            <div className="flex flex-col gap-4 mt-2">
              <PolicyCheck label="Cryptographic Signature" pass={true} />
              <PolicyCheck label="Token Expiration" pass={true} />
              <PolicyCheck label="IP Trust Verification" pass={false} />
              <PolicyCheck label="Device Fingerprint" pass={false} />
              <PolicyCheck label="Behavioral Score" pass={false} />
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Ban className="text-red-600" size={24} />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">DENIED</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Action Enforced</div>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard number="04" title="Intercepted Entity">
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 mt-2">
              <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3 border-b border-slate-200 pb-2">
                Intercepted Context
              </h4>
              <div className="space-y-2.5 text-sm">
                <InfoRow label="Target" value="Patient Vitals API" />
                <InfoRow label="IP" value={<span className="font-mono text-red-600 bg-red-100 px-1 rounded">{activeProfile.ip}</span>} />
                <InfoRow label="Device" value={activeProfile.device} />
                <InfoRow label="Location" value={activeProfile.loc} />
                <InfoRow
                  label="Reason"
                  value={<span className="text-red-600 font-medium">Device fingerprint does not match approved/trusted context</span>}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-sm">
                <Lock size={18} /> Blacklist IP
              </button>
            </div>
          </DashboardCard>
        </div>

        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Shield className="text-red-500" size={18} />
            Blacklist Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BlacklistItem
              icon={<User />}
              title="Targeted Clinician"
              value="Ava Sharma"
            />
            <BlacklistItem
              icon={<Database />}
              title="Targeted Patient"
              value="Rajesh Kumar"
            />
            <BlacklistItem
              icon={<Fingerprint />}
              title="Device Fingerprint"
              value={<span className="font-mono text-slate-700">{activeProfile.mac}</span>}
            />
            <BlacklistItem
              icon={<Globe />}
              title="IP Address"
              value={<span className="font-mono text-slate-700">{activeProfile.ip}</span>}
            />
            <button className="col-span-1 md:col-span-2 lg:col-span-4 mt-2 w-full rounded-lg bg-slate-100 border border-slate-300 py-3 text-slate-700 font-bold hover:bg-slate-200 transition">
              View Extended Forensics
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({ number, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between min-h-[420px] shadow-sm">
      <div>
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <span className="text-xs font-mono font-bold text-slate-400">
            {number}
          </span>
          <h2 className="font-bold text-slate-800 uppercase tracking-widest text-sm">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}

function TimelineEvent({ time, title, desc, status, last }) {
  const colors = {
    success: "bg-green-50 border-green-200 text-green-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    danger: "bg-red-50 border-red-200 text-red-700",
  };
  const dotColors = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };
  return (
    <div className="flex gap-4 relative">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mt-1.5 z-10 ${dotColors[status]}`} />
        {!last && <div className="w-0.5 h-full bg-slate-200 -mt-1.5" />}
      </div>
      <div className={`flex-1 pb-4 ${last ? "" : "border-slate-200"}`}>
        <div className={`p-3 rounded-xl border ${colors[status]} shadow-sm`}>
          <div className="flex justify-between items-start">
            <span className="font-bold text-sm">{title}</span>
            <span className="text-xs font-mono opacity-80">{time}</span>
          </div>
          <p className="text-xs mt-1 opacity-90">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function PolicyCheck({ label, pass }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {pass ? (
        <CheckCircle className="text-green-500" size={20} />
      ) : (
        <XCircle className="text-red-500" size={20} />
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-slate-500 text-xs uppercase font-bold tracking-widest">{label}</span>
      <span className="text-slate-900 font-medium text-right text-sm">{value}</span>
    </div>
  );
}

function RiskFactor({ icon, label, score }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-600">
        {React.cloneElement(icon, { size: 16 })}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-red-600 font-mono font-bold bg-red-50 px-2 py-0.5 rounded text-sm border border-red-100">
        {score}
      </span>
    </div>
  );
}

function BlacklistItem({ icon, title, value }) {
  return (
    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm">
      <div className="text-slate-400 bg-white p-2 border border-slate-200 rounded-lg shadow-sm">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">
          {title}
        </div>
        <div className="text-slate-900 font-bold text-sm">{value}</div>
      </div>
    </div>
  );
}
