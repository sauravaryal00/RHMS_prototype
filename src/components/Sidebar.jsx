import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  User, 
  Stethoscope, 
  Users, 
  FileSearch, 
  ShieldAlert, 
  BarChart3, 
  Activity, 
  Settings,
  LogOut,
  Terminal
} from 'lucide-react';
import { roles } from '../utils/mockData';

const Sidebar = ({ role = 'admin' }) => {
  const navItems = [
    { name: 'System Overview', path: '/admin', icon: Home, roles: ['admin'] },
    { name: 'Deep Analysis', path: '/terminal', icon: Terminal, roles: ['admin'] },
    { name: 'Patient Card', path: '/patient', icon: User, roles: ['patient', 'admin'] },
    { name: 'Clinician Portal', path: '/clinician', icon: Stethoscope, roles: ['clinician', 'admin'] },
    { name: 'Caregiver Flow', path: '/caregiver', icon: Users, roles: ['caregiver', 'admin'] },
    { name: 'Audit Log', path: '/audit', icon: FileSearch, roles: ['admin', 'clinician'] },
    { name: 'Anomalies', path: '/anomalies', icon: ShieldAlert, roles: ['admin'] },
    { name: 'Baselines', path: '/baselines', icon: Activity, roles: ['admin'], disabled: true },
    { name: 'Experiments', path: '/experiments', icon: BarChart3, roles: ['admin'], disabled: true },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));
  const currentRole = roles.find(r => r.id === role);

  return (
    <aside className="w-64 h-screen bg-surface border-r border-white/5 flex flex-col fixed left-0 top-0 z-30">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Activity className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-text-primary tracking-tight">RHMS</h2>
            <p className="text-[10px] text-primary/70 font-mono">MIT233932 PROTOTYPE</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-6">
          <div className="text-2xl">{currentRole?.icon}</div>
          <div>
            <div className="text-xs text-muted font-medium uppercase">{currentRole?.name}</div>
            <div className="text-[10px] text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Online
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.disabled ? '#' : item.path}
              onClick={(e) => item.disabled && e.preventDefault()}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                ${item.disabled ? 'opacity-30 grayscale cursor-not-allowed' : ''}
                ${isActive && !item.disabled
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]' 
                  : 'text-muted hover:text-text-primary hover:bg-white/5'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-colors ${(isActive && !item.disabled) ? 'text-primary' : ''}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                  {item.disabled && <span className="ml-auto text-[8px] font-bold opacity-50">LOCKED</span>}
                  {isActive && !item.disabled && (
                    <motion.div 
                      layoutId="active-pill"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#00d4ff]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        <NavLink 
          to="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-danger/70 hover:text-danger hover:bg-danger/5 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
