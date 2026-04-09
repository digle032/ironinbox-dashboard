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
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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
    <div className="rounded-xl border overflow-hidden
                    bg-white border-slate-200 shadow-sm
                    dark:bg-[var(--dm-surface-popover)] dark:border-[var(--dm-border)] dark:shadow-none">

      <div className="px-5 py-3 border-b bg-white dark:bg-[var(--dm-bg-elevated)] dark:border-[var(--dm-border)] border-slate-100">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-[var(--dm-text-muted)] dark:font-mono">
          Engagement Log
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5 dark:text-[var(--dm-text-mono)]">
          Last 50 visits (unique per user, page, day)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-[var(--dm-border)] dark:bg-[var(--dm-bg-elevated)]">
              <th className="px-5 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-muted)] dark:font-mono">
                User Email
              </th>
              <th className="px-5 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-muted)] dark:font-mono">
                Page
              </th>
              <th className="px-5 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-muted)] dark:font-mono">
                Date & Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[var(--dm-border)]">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-sm text-slate-400 dark:text-[var(--dm-text-muted)]">
                  No engagement entries yet.
                </td>
              </tr>
            ) : (
              entries.map((row, idx) => (
                <tr key={`${row.uid}-${row.page}-${row.timestamp}-${idx}`}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-2.5 font-medium text-slate-800 truncate max-w-[200px] dark:text-[var(--dm-text-secondary)] dark:font-mono text-xs">
                    {row.email || '—'}
                  </td>
                  <td className="px-5 py-2.5 text-slate-600 text-xs dark:text-[var(--dm-text-muted)]">
                    {row.page}
                  </td>
                  <td className="px-5 py-2.5 text-slate-400 tabular-nums whitespace-nowrap text-xs dark:text-[var(--dm-text-muted)] dark:font-mono">
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

  if (skipRoleGate) return panel;

  return (
    <RoleGate permission="canViewEngagementLog">
      {panel}
    </RoleGate>
  );
};

export default EngagementLog;
