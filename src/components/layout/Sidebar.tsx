import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  RiHomeLine, 
  RiInboxLine, 
  RiFlagLine, 
  RiEyeLine, 
  RiLockLine, 
  RiSettings3Line,
  RiLogoutBoxLine,
  RiUserLine
} from 'react-icons/ri';
import { SiMinutemailer } from 'react-icons/si';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const { profile } = useSettings();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <RiHomeLine className="w-5 h-5" /> },
    { name: 'Inbox', path: '/inbox', icon: <RiInboxLine className="w-5 h-5" /> },
    { name: 'Flagged Emails', path: '/flagged-emails', icon: <RiFlagLine className="w-5 h-5" /> },
    { name: 'Keyword Monitoring', path: '/keyword-monitoring', icon: <RiEyeLine className="w-5 h-5" /> },
    { name: 'Privacy & Security', path: '/privacy', icon: <RiLockLine className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <RiSettings3Line className="w-5 h-5" /> }
  ];

  return (
    <div className="w-72 bg-white/95 backdrop-blur-xl h-screen flex flex-col border-r border-slate-200/60 shadow-xl shadow-slate-200/50 fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-8 pb-6">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-xl"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <SiMinutemailer className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">IronInbox</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Secure Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-6">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-4">Main Menu</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-sm shadow-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.6)]"></div>
              )}
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-blue-600' : 'group-hover:scale-110 group-hover:text-slate-900'}`}>
                {item.icon}
              </div>
              <span className="relative z-10">{item.name}</span>
              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 m-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all duration-300 group">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center space-x-3 p-2 rounded-xl transition-colors outline-none"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative w-10 h-10 bg-gradient-to-tr from-slate-200 to-white rounded-full flex items-center justify-center text-slate-700 font-bold border-2 border-white shadow-sm overflow-hidden">
                <img 
                  src={profile.avatar} 
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{profile.name}</p>
              <p className="text-xs text-slate-500 truncate group-hover:text-slate-600 transition-colors">{profile.role}</p>
            </div>
            <div className={`transform transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Dropdown Menu */}
          <div className={`absolute bottom-full left-0 right-0 mb-3 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden transition-all duration-300 origin-bottom ${showDropdown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
            <div className="p-1">
              <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm text-slate-700 transition-colors group/item">
                <RiUserLine className="w-4 h-4 text-slate-400 group-hover/item:text-blue-500 transition-colors" />
                <span className="font-medium">My Profile</span>
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-sm text-red-600 transition-colors group/item">
                <RiLogoutBoxLine className="w-4 h-4 text-red-400 group-hover/item:text-red-500 transition-colors" />
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
