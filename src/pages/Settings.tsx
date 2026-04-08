import React from 'react';
import Header from '../components/layout/Header';
import { RiSunLine, RiMoonLine } from 'react-icons/ri';
import { useTheme } from '../contexts/ThemeContext';
import { useRole } from '../utils/useRole';
import { setDevRole } from '../utils/devRoleHelper';
import type { UserRole } from '../types/roles';
import EngagementLog from '../components/dashboard/EngagementLog';
import { useEngagementTracker } from '../utils/useEngagementTracker';

const ROLE_OPTIONS: { value: UserRole; label: string; blurb: string }[] = [
  { value: 'viewer',  label: 'Viewer',  blurb: 'Dashboard only; sensitive areas hidden.' },
  { value: 'manager', label: 'Manager', blurb: 'Inbox, Flagged Emails, Keyword Monitoring.' },
  { value: 'admin',   label: 'Admin',   blurb: 'Full access including Engagement Log on the dashboard.' },
];

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { role, permissions } = useRole();

  useEngagementTracker('settings');

  const panel = 'bg-white border border-slate-200 rounded-xl p-5 dark:bg-[#0a1628] dark:border-[#0f2a4a]';
  const sectionHead = 'text-sm font-semibold text-slate-800 dark:text-[#e2e8f0] mb-1';

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#040c18]">
      <Header title="Settings" />

      <div className="w-full max-w-3xl mx-auto px-6 py-6 space-y-4">

        {/* Appearance */}
        <div className={panel}>
          <h2 className={sectionHead}>Appearance</h2>
          <p className="text-xs text-slate-400 mb-4 dark:text-[#2a4a6a]">Switch between light and dark interface.</p>
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                       border-slate-200 bg-white text-slate-700 hover:bg-slate-50
                       dark:border-[#0f2a4a] dark:bg-[#0f2040] dark:text-[#94a3b8] dark:hover:bg-[#132843] dark:hover:text-[#e2e8f0]"
          >
            {theme === 'dark' ? (
              <><RiSunLine className="w-4 h-4 text-amber-500" /><span>Switch to Light</span></>
            ) : (
              <><RiMoonLine className="w-4 h-4 text-slate-600" /><span>Switch to Dark</span></>
            )}
          </button>
        </div>

        {/* Role preview */}
        <div className={`${panel} border-amber-200 dark:border-amber-900/40`}>
          <h2 className={sectionHead}>Role Preview (Mock)</h2>
          <p className="text-xs text-slate-400 mb-4 dark:text-[#2a4a6a]">
            Switch roles locally to see how the dashboard and navigation change. Not a real permission server —
            updates this browser session via{' '}
            <code className="text-[10px] bg-slate-100 dark:bg-[#060f1e] px-1.5 py-0.5 rounded font-mono">localStorage</code>.
          </p>

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2 dark:text-[#2a4a6a] dark:font-mono">
            Active Role
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            {ROLE_OPTIONS.map((opt) => {
              const selected = role === opt.value;
              return (
                <button key={opt.value} type="button" onClick={() => setDevRole(opt.value)}
                  className={`text-left rounded-lg border px-4 py-3 min-w-[120px] transition-all text-sm
                             ${selected
                               ? 'border-blue-500 bg-blue-50 dark:border-cyan-500/50 dark:bg-cyan-500/10'
                               : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-[#1a3554] dark:bg-[#0f2040] dark:hover:bg-[#132843]'}`}>
                  <span className={`block font-semibold ${selected ? 'text-blue-700 dark:text-cyan-300' : 'text-slate-800 dark:text-[#94a3b8]'}`}>
                    {opt.label}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5 dark:text-[#2a4a6a]">{opt.blurb}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-[#0f2a4a]">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2 dark:text-[#2a4a6a]">
              Unlocks for <span className="text-slate-700 dark:text-[#94a3b8] capitalize">{role}</span>
            </p>
            <ul className="space-y-1.5">
              {[
                { label: 'Inbox',                      key: 'canViewInbox' },
                { label: 'Flagged Emails',              key: 'canViewFlaggedEmails' },
                { label: 'Keyword Monitoring',          key: 'canViewKeywordMonitoring' },
                { label: 'Engagement Log on Dashboard', key: 'canViewEngagementLog' },
              ].map(({ label, key }) => {
                const allowed = permissions[key as keyof typeof permissions];
                return (
                  <li key={key} className={`flex items-center gap-2 text-xs font-medium ${allowed ? 'text-slate-700 dark:text-[#94a3b8]' : 'text-slate-400 dark:text-[#1a3554] opacity-50'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${allowed ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-[#1a3554]'}`} />
                    {label} — {allowed ? 'visible' : 'hidden'}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Engagement tracker */}
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-[#e2e8f0]">Engagement Tracker</h2>
            <p className="text-xs text-slate-400 mt-1 dark:text-[#2a4a6a]">
              Recent visits stored in this browser (unique per user, page, and day). On the dashboard, shown only for Admin.
            </p>
          </div>
          <EngagementLog skipRoleGate />
        </div>
      </div>
    </div>
  );
};

export default Settings;
