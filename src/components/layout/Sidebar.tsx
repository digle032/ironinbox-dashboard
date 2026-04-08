import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../utils/useRole';
import { ROLE_LABELS } from '../../types/roles';
import { 
  RiHomeLine, 
  RiInboxLine, 
  RiFlagLine, 
  RiEyeLine,
  RiLockLine,
  RiLogoutBoxLine,
  RiUserLine,
  RiAlarmWarningLine,
  RiSettings3Line,
} from 'react-icons/ri';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  canViewInbox?: boolean;
  canViewFlaggedEmails?: boolean;
  canViewKeywordMonitoring?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  canViewInbox = true,
  canViewFlaggedEmails = true,
  canViewKeywordMonitoring = true,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { profile } = useSettings();
  const { signOut, monitoredEmail } = useAuth();
  const { role } = useRole();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <RiHomeLine className="w-4 h-4" /> },
    { name: 'Inbox', path: '/inbox', icon: <RiInboxLine className="w-4 h-4" /> },
    { name: 'Flagged Emails', path: '/flagged-emails', icon: <RiFlagLine className="w-4 h-4" /> },
    { name: 'Incidents', path: '/incidents', icon: <RiAlarmWarningLine className="w-4 h-4" /> },
    { name: 'Keyword Monitoring', path: '/keyword-monitoring', icon: <RiEyeLine className="w-4 h-4" /> },
    { name: 'Privacy & Access', path: '/privacy-access-control', icon: <RiLockLine className="w-4 h-4" /> },
    { name: 'Settings', path: '/settings', icon: <RiSettings3Line className="w-4 h-4" /> }
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.path === '/inbox') return canViewInbox;
    if (item.path === '/flagged-emails') return canViewFlaggedEmails;
    if (item.path === '/keyword-monitoring') return canViewKeywordMonitoring;
    return true;
  });

  return (
    <div className="w-72 h-screen flex flex-col fixed left-0 top-0 z-50
                    bg-white border-r border-slate-200 shadow-xl
                    dark:bg-[#060f1e] dark:border-[#0f2a4a] dark:shadow-none">

      {/* ── Brand ─────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-[#0f2a4a]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#0a1628]">
            <img src="/logo.png" alt="IronInbox" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight dark:text-white">IronInbox</h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-cyan-500/60 dark:font-mono mt-px">
              Security Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 px-3 mb-3
                      dark:text-[#2a4a6a] dark:font-mono">
          Navigation
        </p>
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative text-sm
                ${isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-cyan-500/10 dark:text-cyan-300 dark:font-medium'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium dark:text-[#4a6080] dark:hover:text-slate-200 dark:hover:bg-white/[0.03]'
                }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full
                                bg-blue-600 dark:bg-cyan-400" />
              )}

              <span className={`flex-shrink-0 transition-colors duration-200
                ${isActive
                  ? 'text-blue-600 dark:text-cyan-400'
                  : 'text-slate-400 group-hover:text-slate-600 dark:text-[#2a4a6a] dark:group-hover:text-slate-400'
                }`}>
                {item.icon}
              </span>
              <span className="tracking-wide">{item.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-cyan-400 dark:shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Monitored Email ────────────────────────────────── */}
      {monitoredEmail && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-lg
                        bg-blue-50 border border-blue-100
                        dark:bg-[#0a1f35] dark:border-[#0f2a4a]">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono">
            Monitoring
          </p>
          <p className="text-xs font-medium text-slate-700 truncate mt-0.5 dark:text-cyan-400/70 dark:font-mono"
             title={monitoredEmail}>
            {monitoredEmail}
          </p>
        </div>
      )}

      {/* ── User Profile ───────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-slate-100 dark:border-[#0f2a4a]">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors
                       hover:bg-slate-50 dark:hover:bg-white/[0.03] group"
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm
                              dark:border-[#0f2a4a]">
                <img src={profile.avatar} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full dark:border-[#060f1e]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-700
                            dark:text-[#e2e8f0] dark:group-hover:text-cyan-300">
                {profile.name}
              </p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-[#2a4a6a]">
                {ROLE_LABELS[role]}
              </p>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-slate-300 transition-transform dark:text-[#2a4a6a] ${showDropdown ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          <div className={`absolute bottom-full left-0 right-0 mb-1 rounded-lg border shadow-xl overflow-hidden transition-all duration-200 origin-bottom
                          bg-white border-slate-200 shadow-slate-200/60
                          dark:bg-[#0a1628] dark:border-[#0f2a4a] dark:shadow-black/60
                          ${showDropdown ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className="p-1">
              <button
                onClick={() => { setShowDropdown(false); navigate('/account'); }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors
                           dark:text-[#94a3b8] dark:hover:bg-white/[0.04] dark:hover:text-[#e2e8f0]"
              >
                <RiUserLine className="w-3.5 h-3.5 text-slate-400 dark:text-[#2a4a6a]" />
                <span className="font-medium">My Profile</span>
              </button>
              <div className="h-px my-0.5 bg-slate-100 dark:bg-[#0f2a4a]" />
              <button
                onClick={async () => { await signOut(); navigate('/login'); }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-950/30"
              >
                <RiLogoutBoxLine className="w-3.5 h-3.5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
