import React, { useEffect, useState } from 'react';
import {
  ENGAGEMENT_LOG_KEY,
  ENGAGEMENT_LOG_UPDATED_EVENT,
  type EngagementLogEntry,
} from '../../utils/useEngagementTracker';
import RoleGate from '../common/RoleGate';

function readLog(): EngagementLogEntry[] {
  try {
    const raw = localStorage.getItem(ENGAGEMENT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as EngagementLogEntry[]) : [];
  } catch {
    return [];
  }
}

export interface EngagementLogProps {
  skipRoleGate?: boolean;
}

const EngagementLog: React.FC<EngagementLogProps> = ({ skipRoleGate }) => {
  const [entries, setEntries] = useState<EngagementLogEntry[]>(() => readLog());

  useEffect(() => {
    const refresh = () => {
      const all = readLog();
      const sorted = [...all].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setEntries(sorted.slice(0, 50));
    };

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(ENGAGEMENT_LOG_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(ENGAGEMENT_LOG_UPDATED_EVENT, refresh);
    };
  }, []);

  const panel = (

      <div className="rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/40 overflow-hidden ring-1 ring-slate-900/[0.04] dark:border-[#334155] dark:bg-[#1e293b] dark:shadow-lg dark:shadow-black/30 dark:ring-white/[0.06]">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 dark:border-[#334155] dark:bg-[#0f172a]/80">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest dark:text-[#94a3b8]">
            Engagement log
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 dark:text-[#94a3b8]">
            Last 50 visits (unique per user, page, day)
          </p>
        </div>

        <div className="overflow-x-auto bg-white dark:bg-[#1e293b]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 dark:border-[#334155] dark:bg-[#0f172a]/60">
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider dark:text-[#94a3b8]">
                  User email
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider dark:text-[#94a3b8]">
                  Page
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider dark:text-[#94a3b8]">
                  Date & time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
              {entries.length === 0 ? (
                <tr className="bg-white dark:bg-[#1e293b]">
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-slate-500 text-sm dark:text-[#94a3b8]"
                  >
                    No engagement entries yet.
                  </td>
                </tr>
              ) : (
                entries.map((row, idx) => (
                  <tr
                    key={`${row.uid}-${row.page}-${row.timestamp}-${idx}`}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-[#243247]"
                  >
                    <td className="px-6 py-3 text-slate-900 font-medium truncate max-w-[200px] dark:text-[#f8fafc]">
                      {row.email || '—'}
                    </td>
                    <td className="px-6 py-3 text-slate-700 dark:text-[#cbd5e1]">{row.page}</td>
                    <td className="px-6 py-3 text-slate-500 tabular-nums whitespace-nowrap dark:text-[#94a3b8]">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
  );

  if (skipRoleGate) {
    return panel;
  }

  return (
    <RoleGate permission="canViewEngagementLog">
      {panel}
    </RoleGate>
  );
};

export default EngagementLog;
