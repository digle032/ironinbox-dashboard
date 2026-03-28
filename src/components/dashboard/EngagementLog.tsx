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

const EngagementLog: React.FC = () => {
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

  return (
    <RoleGate permission="canViewEngagementLog">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-xl shadow-slate-950/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/80 bg-slate-800/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Engagement log
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Last 50 visits (unique per user, page, day)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700/80 bg-slate-800/30">
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  User email
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Date & time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-slate-500 text-sm"
                  >
                    No engagement entries yet.
                  </td>
                </tr>
              ) : (
                entries.map((row, idx) => (
                  <tr
                    key={`${row.uid}-${row.page}-${row.timestamp}-${idx}`}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-3 text-slate-200 font-medium truncate max-w-[200px]">
                      {row.email || '—'}
                    </td>
                    <td className="px-6 py-3 text-slate-300">{row.page}</td>
                    <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGate>
  );
};

export default EngagementLog;
