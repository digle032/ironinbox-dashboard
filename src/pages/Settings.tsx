import React from 'react';
import Header from '../components/layout/Header';
import { RiSunLine, RiMoonLine } from 'react-icons/ri';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex-1 overflow-auto dark:bg-[#0f172a]">
      <Header title="Settings" />

      <div className="p-8 max-w-4xl">
        <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-[#1e293b] dark:border-[#334155]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1 dark:text-[#f8fafc]">Appearance</h2>
              <p className="text-sm text-slate-500 dark:text-[#94a3b8]">
                Light or dark theme for this app only. Your OS or browser theme is not used.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === 'dark'}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 font-medium shadow-sm hover:bg-gray-50 transition-colors dark:border-[#334155] dark:bg-[#243247] dark:text-[#f8fafc] dark:hover:bg-[#1e293b] dark:shadow-[0_0_20px_rgba(59,130,246,0.12)]"
            >
              {theme === 'dark' ? (
                <>
                  <RiSunLine className="w-5 h-5 text-amber-500" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <RiMoonLine className="w-5 h-5 text-slate-600" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
