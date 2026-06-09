import React from "react";
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

export default function SecurityMonitoringDashboard() {
  return (
    <div className="min-h-screen bg-[#050b16] text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#07111f] border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl border border-red-500 flex items-center justify-center text-red-400">
              <Activity size={28} />
            </div>
            <h1 className="text-3xl font-bold">RHMS</h1>
          </div>

          <nav className="px-4 py-6 space-y-3">
            <SidebarItem icon={<Grid2X2 />} text="Overview" active />
            <SidebarItem icon={<Server />} text="Sessions" />
            <SidebarItem icon={<AlertTriangle />} text="Anomalies" />
            <SidebarItem icon={<Router />} text="Policy Gateway" />
            <SidebarItem icon={<Monitor />} text="Devices" />
            <SidebarItem icon={<Ban />} text="Blacklist" />
            <SidebarItem icon={<ClipboardList />} text="Audit Trail" />
            <SidebarItem icon={<FileText />} text="Reports" />
            <SidebarItem icon={<Settings />} text="Settings" />
          </nav>
        </div>

        <div className="p-4">
          <div className="rounded-xl border border-slate-700 bg-[#0b1728] p-4">
            <p className="text-sm text-slate-300">System Status</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-green-400 font-semibold">Operational</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Uptime: 99.98%</p>
          </div>

          <p className="text-xs text-slate-500 mt-6">
            RHMS Security Console v1.2.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
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

          <div className="flex items-center gap-4">
            <div className="border border-red-500 rounded-xl px-5 py-3 bg-[#120b10]">
              <p className="text-xs text-slate-300">RISK SCORE</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-red-500">8.6</span>
                <span className="text-red-400 text-xs font-semibold mb-1">
                  HIGH RISK
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-[#0b1728] px-5 py-3 text-slate-300">
              All Sites
            </div>

            <div className="w-11 h-11 rounded-full bg-[#0b1728] border border-slate-700 flex items-center justify-center">
              S
            </div>
          </div>
        </header>

        {/* Alert Banner */}
        <section className="rounded-2xl border border-slate-700 bg-[#081426] px-6 py-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-700 flex items-center justify-center">
              <Shield className="text-red-400" />
            </div>
            <div>
              <p className="font-semibold">
                Anomaly detected{" "}
                <span className="text-red-400">after</span> an approved session
                was established.
              </p>
              <p className="text-sm text-slate-400">
                Session was approved. Interception triggered by post-approval
                risk event.
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">DETECTED AT</p>
            <p className="text-red-400 font-bold">10:42:18 AM IST</p>
          </div>
        </section>

        {/* Top Cards */}
        <section className="grid grid-cols-4 gap-5 mb-5">
          <DashboardCard number="1" title="APPROVED SESSION" status="ok">
            <InfoRow icon={<User />} label="Patient" value="Ava Sharma" />
            <InfoRow
              icon={<Stethoscope />}
              label="Clinician"
              value="Dr. Rohan Mehta"
            />
            <InfoRow
              icon={<Target />}
              label="Purpose"
              value="Emergency cardiac review"
            />
            <InfoRow icon={<Database />} label="Scope" value="Vital Signs + ECG" />
            <InfoRow
              icon={<Shield />}
              label="Token Status"
              value={<StatusChip color="green">VALID</StatusChip>}
            />
            <InfoRow icon={<Clock />} label="Expires in" value="27 minutes" />

            <SmallFooter
              icon={<Shield />}
              title="Session approved at"
              value="10:14:05 AM IST"
            />
          </DashboardCard>

          <DashboardCard number="2" title="DETECTED ANOMALY" status="warning">
            <InfoRow
              label="Event"
              value={
                <span className="text-red-400">
                  Access attempt after approval from unregistered device
                </span>
              }
            />
            <InfoRow label="IP" value="185.xxx.xxx.xxx" />
            <InfoRow label="Device" value="Unknown Chrome/Linux" />
            <InfoRow label="Location" value="Foreign network" />
            <InfoRow
              label="Reason"
              value="Device fingerprint does not match approved/trusted context"
            />
            <InfoRow
              label="Risk Score"
              value={<StatusChip color="red">HIGH</StatusChip>}
            />

            <SmallFooter
              icon={<Target />}
              title="Detected at"
              value="10:42:18 AM IST"
            />
          </DashboardCard>

          <DashboardCard number="3" title="POLICY GATEWAY DECISION">
            <GatewayRow label="Consent token" status="VALID" type="success" />
            <GatewayRow label="Purpose" status="MATCHED" type="success" />
            <GatewayRow label="Scope" status="MATCHED" type="success" />
            <GatewayRow label="Device context" status="FAILED" type="danger" />
            <GatewayRow label="Network context" status="FAILED" type="danger" />

            <div className="border-t border-slate-700 mt-4 pt-4">
              <p className="text-xs text-slate-400 mb-2">Final decision</p>
              <div className="rounded-lg border border-red-700 bg-red-950/40 py-3 text-center">
                <Lock className="inline mr-2 text-red-400" size={22} />
                <span className="text-3xl font-bold text-red-500">
                  BLOCKED
                </span>
              </div>
            </div>

            <SmallFooter
              icon={<ClipboardList />}
              title="Decided at"
              value="10:42:18 AM IST"
            />
          </DashboardCard>

          <DashboardCard number="4" title="SYSTEM ACTION">
            <ActionRow icon={<Settings />} text="Token temporarily frozen" />
            <ActionRow
              icon={<Fingerprint />}
              text="Device fingerprint blacklisted"
            />
            <ActionRow icon={<ClipboardList />} text="Audit event recorded" />
            <ActionRow icon={<AlertTriangle />} text="Admin review required" />

            <SmallFooter
              icon={<Zap />}
              title="Action initiated at"
              value="10:42:19 AM IST"
            />
          </DashboardCard>
        </section>

        {/* Bottom Cards */}
        <section className="grid grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-700 bg-[#081426] p-6">
            <h3 className="font-bold mb-6">RISK OVERVIEW</h3>

            <div className="flex flex-col items-center">
              <div className="relative w-44 h-24 overflow-hidden">
                <div className="absolute inset-0 border-[18px] border-slate-700 rounded-t-full border-b-0" />
                <div className="absolute inset-0 border-[18px] border-red-500 rounded-t-full border-b-0 rotate-[35deg] origin-bottom" />
              </div>

              <p className="text-5xl font-bold text-red-500 mt-2">8.6</p>
              <p className="text-red-400 font-bold">HIGH RISK</p>
            </div>

            <p className="text-sm text-slate-400 mt-6">
              The anomaly was detected post-approval. Active controls prevented
              unauthorized access.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-[#081426] p-6">
            <h3 className="font-bold mb-6">BLACKLIST STATUS</h3>

            <BlacklistItem
              icon={<Fingerprint />}
              title="Device Fingerprint"
              value="a4f2c9b7e3d44b16"
            />

            <BlacklistItem
              icon={<Globe />}
              title="IP Address"
              value="185.xxx.xxx.xxx"
            />

            <button className="mt-5 w-full rounded-lg bg-[#101c2e] border border-slate-700 py-3 text-slate-300 hover:bg-[#15243a]">
              View Blacklist Registry →
            </button>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-[#081426] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">AUDIT / EVENT TIMELINE</h3>
              <button className="text-xs bg-[#101c2e] px-4 py-2 rounded-lg border border-slate-700">
                View All
              </button>
            </div>

            <TimelineItem
              color="green"
              time="10:14:05 AM"
              title="Session approved"
              text="Patient: Ava Sharma | Clinician: Dr. Rohan Mehta | Scope: Vital Signs + ECG"
            />

            <TimelineItem
              color="yellow"
              time="10:42:18 AM"
              title="Anomaly detected"
              text="Access attempt from unregistered device (185.xxx.xxx.xxx)"
            />

            <TimelineItem
              color="red"
              time="10:42:18 AM"
              title="Policy evaluation"
              text="Device context failed | Network context failed"
            />

            <TimelineItem
              color="red"
              time="10:42:19 AM"
              title="Access blocked"
              text="Token frozen | Device blacklisted | Audit recorded"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-6 text-xs text-slate-500 flex justify-between">
          <span>Site: City Cardiac Center</span>
          <span>Environment: Prototype Testing</span>
          <span>User: security.admin</span>
          <span className="text-green-400">● Sync: 10:42:20 AM IST</span>
        </footer>
      </main>
    </div>
  );
}

function SidebarItem({ icon, text, active }) {
  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-lg ${
        active
          ? "bg-red-950/50 text-red-400 border border-red-800"
          : "text-slate-400 hover:bg-[#101c2e]"
      }`}
    >
      {React.cloneElement(icon, { size: 20 })}
      <span>{text}</span>
    </div>
  );
}

function DashboardCard({ number, title, children, status }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#081426] p-5 flex flex-col justify-between min-h-[420px]">
      <div>
        <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-950 text-red-400 font-bold">
              {number}
            </span>
            <h3 className="font-bold text-sm">{title}</h3>
          </div>

          {status === "ok" && <CheckCircle className="text-green-400" />}
          {status === "warning" && <AlertTriangle className="text-orange-400" />}
        </div>

        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="grid grid-cols-[24px_90px_1fr] gap-3 items-start text-sm">
      <div className="text-slate-400">{icon && React.cloneElement(icon, { size: 18 })}</div>
      <p className="text-slate-400">{label}</p>
      <div className="text-white">{value}</div>
    </div>
  );
}

function GatewayRow({ label, status, type }) {
  return (
    <div className="flex justify-between items-center mb-3 text-sm">
      <span className="text-slate-300">{label}</span>
      <StatusChip color={type === "success" ? "green" : "red"}>{status}</StatusChip>
    </div>
  );
}

function StatusChip({ children, color }) {
  const styles =
    color === "green"
      ? "bg-green-950 text-green-400 border-green-700"
      : "bg-red-950 text-red-400 border-red-700";

  return (
    <span className={`px-3 py-1 rounded-lg border text-xs font-bold ${styles}`}>
      {children}
    </span>
  );
}

function ActionRow({ icon, text }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-10 h-10 rounded-full bg-red-950/70 border border-red-800 flex items-center justify-center text-red-400">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

function SmallFooter({ icon, title, value }) {
  return (
    <div className="mt-5 rounded-xl bg-[#101c2e] border border-slate-700 p-3 flex items-center gap-3">
      <div className="text-slate-400">{React.cloneElement(icon, { size: 20 })}</div>
      <div>
        <p className="text-xs text-slate-400">{title}</p>
        <p className="text-sm text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function BlacklistItem({ icon, title, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#101c2e] p-4 mb-4 flex items-start gap-4">
      <div className="text-slate-300">{React.cloneElement(icon, { size: 24 })}</div>
      <div className="flex-1">
        <div className="flex justify-between">
          <p className="text-sm text-slate-300">{title}</p>
          <span className="text-xs text-red-400 bg-red-950 border border-red-800 px-2 py-1 rounded">
            BLACKLISTED
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-2">{value}</p>
        <p className="text-xs text-slate-500">Added: Today, 10:42 AM</p>
      </div>
    </div>
  );
}

function TimelineItem({ color, time, title, text }) {
  const dot =
    color === "green"
      ? "bg-green-500"
      : color === "yellow"
      ? "bg-yellow-400"
      : "bg-red-500";

  return (
    <div className="flex gap-4 border-l border-slate-700 pl-4 pb-5 relative">
      <span className={`absolute -left-[6px] top-1 w-3 h-3 rounded-full ${dot}`} />
      <p className="text-sm text-slate-400 w-24">{time}</p>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{text}</p>
      </div>
    </div>
  );
}
