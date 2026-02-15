import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { RiBellLine, RiSearchLine, RiFileDownloadLine } from 'react-icons/ri';

interface HeaderProps {
  title: string;
  showActions?: boolean;
  onExportPDF?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showActions = false, onExportPDF }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { profile } = useSettings();

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-white/50 shadow-sm shadow-slate-200/40 px-8 py-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Page Title & Breadcrumbs */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Home</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600">{title}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">{title}</h1>
        </div>

        {/* Center Search (Optional - adds balance) */}
        <div className="hidden md:flex flex-1 max-w-md mx-12">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <RiSearchLine className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-11 pr-4 py-2.5 border-0 rounded-2xl bg-slate-100/50 text-slate-600 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg transition-all duration-300 sm:text-sm font-medium"
              placeholder="Search emails, alerts, or keywords..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-slate-400 text-xs font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">⌘K</span>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Action Buttons */}
          {showActions && (
            <div className="flex items-center space-x-3 mr-2 border-r border-slate-200 pr-6">
              <button 
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white hover:bg-blue-600 rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 active:scale-95 text-sm font-medium group"
              >
                <RiFileDownloadLine className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span>Export Report</span>
              </button>
            </div>
          )}

          {/* Notification Bell */}
          <button className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group">
            <RiBellLine className="w-5 h-5 transition-transform group-hover:rotate-12" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm"></span>
          </button>

          <div className="h-8 w-px bg-slate-200/60"></div>

          {/* User Profile Mini */}
          <div className="relative group">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-1 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all duration-200"
            >
              <img 
                src={profile.avatar} 
                alt="Profile" 
                className="w-9 h-9 rounded-full shadow-sm ring-2 ring-white object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
