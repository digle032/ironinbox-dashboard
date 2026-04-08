import React, { useMemo, useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { filterVisibleFlaggedEmails } from '../utils/keywordSignals';
import { useSettings } from '../contexts/SettingsContext';
import Header from '../components/layout/Header';
import StatCard from '../components/common/StatCard';
import RoleGate from '../components/common/RoleGate';
import EngagementLog from '../components/dashboard/EngagementLog';
import { useEngagementTracker } from '../utils/useEngagementTracker';
import { 
  RiShieldCheckLine, 
  RiAlertLine, 
  RiMailLine, 
  RiSpamLine,
  RiFireLine,
  RiTimeLine,
  RiUserLine,
  RiTrophyLine
} from 'react-icons/ri';

const Dashboard: React.FC = () => {
  const { flaggedEmails, releasedEmails, keywords } = useApp();
  const { advanced } = useSettings();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEngagementTracker('dashboard');

  useEffect(() => {
    if (advanced.autoRefresh) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
      }, advanced.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [advanced.autoRefresh, advanced.refreshInterval]);

  const stats = useMemo(() => {
    const visibleFlagged = filterVisibleFlaggedEmails(flaggedEmails, keywords);
    const totalFlagged = visibleFlagged.length;
    const totalReleased = releasedEmails.length;
    const totalProcessed = totalFlagged + totalReleased;
    
    const criticalCount = visibleFlagged.filter(e => e.riskLevel === 'Critical').length;
    const highCount    = visibleFlagged.filter(e => e.riskLevel === 'High').length;
    const mediumCount  = visibleFlagged.filter(e => e.riskLevel === 'Medium').length;
    const lowCount     = visibleFlagged.filter(e => e.riskLevel === 'Low').length;
    
    const riskWeights = { Critical: 100, High: 70, Medium: 40, Low: 20 };
    const totalRiskPoints = (criticalCount * riskWeights.Critical) + (highCount * riskWeights.High) + (mediumCount * riskWeights.Medium) + (lowCount * riskWeights.Low);
    const maxPossibleRisk = totalFlagged * 100;
    const overallRiskScore = totalFlagged > 0 ? Math.round((totalRiskPoints / maxPossibleRisk) * 100) : 0;
    const detectionRate = totalProcessed > 0 ? Math.round((totalFlagged / totalProcessed) * 100) : 0;
    
    const domainCounts: Record<string, number> = {};
    visibleFlagged.forEach(email => {
      const domain = email.sender.split('@')[1] || email.sender;
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });
    const topThreats = Object.entries(domainCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
    const recentReleased = releasedEmails.slice(0, 5);
    
    return { totalFlagged, totalReleased, totalProcessed, criticalCount, highCount, mediumCount, lowCount, overallRiskScore, detectionRate, topThreats, recentReleased, activeKeywords: keywords.filter(k => k.enabled).length };
  }, [flaggedEmails, releasedEmails, keywords]);

  const getRiskInfo = (score: number) => {
    if (score >= 75) return { level: 'Critical', color: 'text-red-500',    stroke: '#ef4444', bg: 'bg-red-950/40',    border: 'border-red-800/60',    badge: 'bg-red-950/50 text-red-400 border-red-800/60' };
    if (score >= 50) return { level: 'High',     color: 'text-orange-500',  stroke: '#f97316', bg: 'bg-orange-950/40', border: 'border-orange-800/60', badge: 'bg-orange-950/50 text-orange-400 border-orange-800/60' };
    if (score >= 25) return { level: 'Medium',   color: 'text-amber-500',   stroke: '#f59e0b', bg: 'bg-amber-950/40',  border: 'border-amber-800/60',  badge: 'bg-amber-950/50 text-amber-400 border-amber-800/60' };
    return              { level: 'Low',      color: 'text-emerald-500', stroke: '#10b981', bg: 'bg-emerald-950/40', border: 'border-emerald-800/60', badge: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60' };
  };

  const riskInfo = getRiskInfo(stats.overallRiskScore);

  /* shared card class */
  const card = 'bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-[#0a1628] dark:border-[#0f2a4a]';
  const cardHead = 'text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono flex items-center gap-2';

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#040c18]">
      <Header title="Dashboard Overview" />

      <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">

        {/* Auto-refresh indicator */}
        {advanced.autoRefresh && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-lg border text-xs
                          bg-blue-50 border-blue-200 dark:bg-cyan-500/5 dark:border-[#0f2a4a]">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-blue-700 font-medium dark:text-cyan-400 dark:font-mono">Live — Auto-refresh active</span>
            </div>
            <span className="text-blue-500 font-mono dark:text-[#2a4a6a]">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Processed"    value={stats.totalProcessed}    icon={<RiMailLine />}        iconColor="text-blue-600"    trend="+8.2%" trendUp={true} />
          <RoleGate permission="canViewFlaggedEmails">
            <div className="contents">
              <StatCard title="Currently Flagged"  value={stats.totalFlagged}      icon={<RiAlertLine />}       iconColor="text-red-600"     trend="+12%"  trendUp={false} />
            </div>
          </RoleGate>
          <StatCard title="Emails Released"    value={stats.totalReleased}     icon={<RiShieldCheckLine />} iconColor="text-emerald-600" trend="+5.4%" trendUp={true} />
          <RoleGate permission="canViewFlaggedEmails">
            <div className="contents">
              <StatCard title="Active Keywords"    value={stats.activeKeywords}    icon={<RiSpamLine />}        iconColor="text-purple-600"  trend="+2"    trendUp={true} />
            </div>
          </RoleGate>
        </div>

        <RoleGate permission="canViewFlaggedEmails">
          <>
            {/* Risk Score + Threat Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Risk Score */}
              <div className={`${card} p-6`}>
                <p className={cardHead}>
                  <RiFireLine className="w-3.5 h-3.5" />
                  Overall Risk Score
                </p>

                <div className="flex flex-col items-center mt-6">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"
                              className="text-slate-100 dark:text-[#0f2040]" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke={riskInfo.stroke}
                        strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${(stats.overallRiskScore / 100) * 251.2} 251.2`}
                        style={{ transition: 'stroke-dasharray 1s ease-in-out', filter: `drop-shadow(0 0 6px ${riskInfo.stroke}60)` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-black tracking-tight dark:font-mono ${riskInfo.color}`}>
                        {stats.overallRiskScore}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-[#2a4a6a] mt-1">
                        Score
                      </span>
                    </div>
                  </div>

                  <div className={`mt-5 px-4 py-1.5 rounded-md border text-xs font-bold uppercase tracking-wider ${riskInfo.badge}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${riskInfo.color.replace('text-', 'bg-')}`} />
                    {riskInfo.level} Risk
                  </div>

                  <p className="text-[11px] text-slate-400 text-center mt-3 dark:text-[#2a4a6a]">
                    {stats.totalFlagged} flagged emails analyzed
                  </p>
                </div>
              </div>

              {/* Threat Distribution */}
              <div className={`${card} p-6 lg:col-span-2`}>
                <p className={cardHead}>Threat Distribution</p>

                <div className="space-y-5 mt-6">
                  {[
                    { label: 'Critical', count: stats.criticalCount, color: 'bg-red-500',    track: 'bg-red-950/30 dark:bg-red-950/40' },
                    { label: 'High',     count: stats.highCount,     color: 'bg-orange-500',  track: 'bg-orange-950/30 dark:bg-orange-950/40' },
                    { label: 'Medium',   count: stats.mediumCount,   color: 'bg-amber-500',   track: 'bg-amber-950/30 dark:bg-amber-950/40' },
                    { label: 'Low',      count: stats.lowCount,      color: 'bg-emerald-500', track: 'bg-emerald-950/30 dark:bg-emerald-950/40' },
                  ].map(({ label, count, color, track }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-2 dark:text-[#94a3b8]">
                          <span className={`w-2 h-2 rounded-full ${color}`} />
                          {label}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-[#e2e8f0]">
                          {count} email{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full ${track}`}>
                        <div
                          className={`${color} h-full rounded-full transition-all duration-1000`}
                          style={{ width: `${stats.totalFlagged > 0 ? (count / stats.totalFlagged) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-[#0f2a4a] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-[#2a4a6a]">Detection Rate</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 dark:text-[#2a4a6a]">
                        {stats.totalFlagged} of {stats.totalProcessed} emails
                      </p>
                    </div>
                    <span className="text-2xl font-black font-mono text-blue-600 dark:text-cyan-400">
                      {stats.detectionRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Threats + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Top Threat Sources */}
              <div className={`${card} p-6`}>
                <p className={cardHead}>
                  <RiTrophyLine className="w-3.5 h-3.5" />
                  Top Threat Sources
                </p>

                {stats.topThreats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-[#2a4a6a]">
                    <RiShieldCheckLine className="w-12 h-12 mb-3 text-emerald-400/50" />
                    <p className="text-sm font-medium">No threats detected</p>
                  </div>
                ) : (
                  <div className="space-y-2 mt-5">
                    {stats.topThreats.map(([domain, count], index) => (
                      <div key={domain}
                           className="flex items-center space-x-3 px-3 py-3 rounded-lg border transition-colors
                                      bg-slate-50 border-slate-100 hover:border-slate-200
                                      dark:bg-[#060f1e] dark:border-[#0f2a4a] dark:hover:border-[#1a3554]">
                        <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold font-mono flex-shrink-0
                                        ${index === 0 ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' :
                                          index === 1 ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400' :
                                          index === 2 ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' :
                                          'bg-slate-200 text-slate-600 dark:bg-[#0f2040] dark:text-[#4a6080]'}`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 font-mono truncate dark:text-[#e2e8f0]">{domain}</p>
                          <p className="text-[10px] text-slate-400 dark:text-[#2a4a6a]">{count} threat{count !== 1 ? 's' : ''}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-300 dark:text-[#1a3554]">
                          {Math.round((count / stats.totalFlagged) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className={`${card} p-6`}>
                <p className={cardHead}>
                  <RiTimeLine className="w-3.5 h-3.5" />
                  Recent Activity
                </p>

                {stats.recentReleased.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-[#2a4a6a]">
                    <RiMailLine className="w-12 h-12 mb-3 text-slate-300 dark:text-[#0f2040]" />
                    <p className="text-sm font-medium">No released emails yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 mt-5">
                    {stats.recentReleased.map((released) => (
                      <div key={released.id}
                           className="flex items-start space-x-3 px-3 py-3 rounded-lg border transition-colors group
                                      bg-slate-50 border-slate-100 hover:border-emerald-200
                                      dark:bg-[#060f1e] dark:border-[#0f2a4a] dark:hover:border-emerald-900/60">
                        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0
                                        bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                          <RiShieldCheckLine className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate dark:text-[#e2e8f0]">
                            {released.originalEmail.subject}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5 dark:text-[#2a4a6a]">
                            {released.originalEmail.sender}
                          </p>
                          <div className="flex items-center space-x-3 mt-1.5">
                            <span className="flex items-center text-[10px] text-slate-400 dark:text-[#2a4a6a]">
                              <RiUserLine className="w-3 h-3 mr-1" />{released.releasedBy}
                            </span>
                            <span className="flex items-center text-[10px] text-slate-400 font-mono dark:text-[#2a4a6a]">
                              <RiTimeLine className="w-3 h-3 mr-1" />{released.releasedAt}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        </RoleGate>

        <EngagementLog />
      </div>
    </div>
  );
};

export default Dashboard;
