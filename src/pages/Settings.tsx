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
  {
    value: 'viewer',
    label: 'Viewer',
    blurb: 'Dashboard only; sensitive areas hidden.',
  },
  {
    value: 'manager',
    label: 'Manager',
    blurb: 'Inbox, Flagged Emails, Keyword Monitoring.',
  },
  {
    value: 'admin',
    label: 'Admin',
    blurb: 'Full access including Engagement Log on the dashboard.',
  },
];

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { role, permissions } = useRole();

  useEngagementTracker('settings');

  return (
    <div className="flex-1 overflow-auto dark:bg-[#0f172a]">
      <Header title="Settings" />
      <div className="p-8 max-w-4xl flex flex-col gap-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-[#1e293b] dark:border-[#334155]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1 dark:text-[#f8fafc]">Appearance</h2>
              <p className="text-sm text-slate-500 dark:text-[#94a3b8]">
                Light or dark appearance for this app.
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

        <div className="bg-white rounded-lg border border-blue-200/80 p-6 dark:bg-[#1e293b] dark:border-amber-900/50">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[#f8fafc]">
              Role preview (mock)
            </h2>
            <p className="text-sm text-slate-500 dark:text-[#94a3b8] mt-1">
              Switch roles locally to see how the dashboard and navigation change. This is not a real
              permission server; it only updates this browser session via{' '}
              <code className="text-xs bg-slate-100 dark:bg-[#0f172a] px-1.5 py-0.5 rounded">
                localStorage
              </code>
              . In production, roles would come from your account or organization.
            </p>
          </div>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-[#94a3b8] mb-3">
            Active role
          </p>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((opt) => {
              const selected = role === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"

                  onClick={() => setDevRole(opt.value)}
                  className={`text-left rounded-xl border px-4 py-3 min-w-[140px] transition-all ${
                    selected
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:bg-blue-950/40 dark:border-blue-400 dark:ring-blue-400/20'
                      : 'border-gray-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-[#334155] dark:bg-[#243247] dark:hover:bg-[#1e293b]'
                  }`}
                >
                  <span className="block text-sm font-semibold text-gray-900 dark:text-[#f8fafc]">
                    {opt.label}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-[#94a3b8] mt-0.5 max-w-[200px]">
                    {opt.blurb}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-[#334155]">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-[#94a3b8] mb-2">
              Unlocks for <span className="text-gray-800 dark:text-[#f8fafc] capitalize">{role}</span>
            </p>
            <ul className="text-sm text-slate-600 dark:text-[#cbd5e1] space-y-1.5 list-disc list-inside">
              <li className={permissions.canViewInbox ? '' : 'opacity-40'}>
                Inbox {permissions.canViewInbox ? '— visible' : '— hidden'}
              </li>
              <li className={permissions.canViewFlaggedEmails ? '' : 'opacity-40'}>
                Flagged Emails {permissions.canViewFlaggedEmails ? '— visible' : '— hidden'}
              </li>
              <li className={permissions.canViewKeywordMonitoring ? '' : 'opacity-40'}>
                Keyword Monitoring {permissions.canViewKeywordMonitoring ? '— visible' : '— hidden'}
              </li>
              <li className={permissions.canViewEngagementLog ? '' : 'opacity-40'}>
                Engagement Log on dashboard {permissions.canViewEngagementLog ? '— visible' : '— hidden'}
              </li>
            </ul>
          </div>
        </div>

        <div>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[#f8fafc]">
              Engagement tracker
            </h2>
            <p className="text-sm text-slate-500 dark:text-[#94a3b8]">
              Recent visits stored in this browser (unique per user, page, and day). Shown here for
              convenience; on the dashboard this panel is only rendered for Admin.
            </p>
          </div>
          <EngagementLog skipRoleGate />
        </div>
      </div>
    </div>
  );
};

export default Settings;
