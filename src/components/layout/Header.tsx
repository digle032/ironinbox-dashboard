import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { RiBellLine, RiSearchLine, RiFileDownloadLine } from 'react-icons/ri';
import { FlaggedEmail } from '../../types';

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
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm shadow-slate-200/50 px-8 py-5 transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Page Title & Breadcrumbs */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium mb-1">
            <span>Home</span>
            <span>/</span>
            <span className="text-blue-500">{title}</span>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">{title}</h1>
        </div>

        {/* Center Search (Optional - adds balance) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <RiSearchLine className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 sm:text-sm shadow-inner"
              placeholder="Global search..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-slate-400 text-xs border border-slate-200 rounded px-1.5 py-0.5">⌘K</span>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Action Buttons */}
          {showActions && (
            <div className="flex items-center space-x-2 mr-4 border-r border-slate-200 pr-4">
              <button 
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-md shadow-blue-500/20 active:scale-95 text-sm font-medium"
              >
                <RiFileDownloadLine className="w-4 h-4" />
                <span>Export PDF Report</span>
              </button>
            </div>
          )}

          {/* Notification Bell */}
          <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group">
            <RiBellLine className="w-5 h-5 transition-transform group-hover:rotate-12" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2"></div>

          {/* User Profile Mini */}
          <div className="relative group">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-1 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all duration-200"
            >
              <img 
                src={profile.avatar} 
                alt="Profile" 
                className="w-8 h-8 rounded-full shadow-sm ring-2 ring-white"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
