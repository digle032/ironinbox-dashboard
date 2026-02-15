import React, { useMemo, useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import Header from '../components/layout/Header';
import StatCard from '../components/common/StatCard';
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

  // Auto-refresh functionality
  useEffect(() => {
    if (advanced.autoRefresh) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
        console.log('🔄 Dashboard auto-refreshed');
      }, advanced.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [advanced.autoRefresh, advanced.refreshInterval]);

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const totalFlagged = flaggedEmails.length;
    const totalReleased = releasedEmails.length;
    const totalProcessed = totalFlagged + totalReleased;
    
    const criticalCount = flaggedEmails.filter(e => e.riskLevel === 'Critical').length;
    const highCount = flaggedEmails.filter(e => e.riskLevel === 'High').length;
    const mediumCount = flaggedEmails.filter(e => e.riskLevel === 'Medium').length;
    const lowCount = flaggedEmails.filter(e => e.riskLevel === 'Low').length;
    
    // Calculate overall risk score (0-100)
    const riskWeights = { Critical: 100, High: 70, Medium: 40, Low: 20 };
    const totalRiskPoints = 
      (criticalCount * riskWeights.Critical) +
      (highCount * riskWeights.High) +
      (mediumCount * riskWeights.Medium) +
      (lowCount * riskWeights.Low);
    const maxPossibleRisk = totalFlagged * 100;
    const overallRiskScore = totalFlagged > 0 ? Math.round((totalRiskPoints / maxPossibleRisk) * 100) : 0;
    
    // Detection rate
    const detectionRate = totalProcessed > 0 ? Math.round((totalFlagged / totalProcessed) * 100) : 0;
    
    // Top threat domains
    const domainCounts: Record<string, number> = {};
    flaggedEmails.forEach(email => {
      const domain = email.sender.split('@')[1] || email.sender;
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });
    const topThreats = Object.entries(domainCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    // Recent activity (last 5 released emails)
    const recentReleased = releasedEmails.slice(0, 5);
    
    return {
      totalFlagged,
      totalReleased,
      totalProcessed,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      overallRiskScore,
      detectionRate,
      topThreats,
      recentReleased,
      activeKeywords: keywords.length
    };
  }, [flaggedEmails, releasedEmails, keywords]);

  const getRiskLevel = (score: number) => {
    if (score >= 75) return { level: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    if (score >= 50) return { level: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    if (score >= 25) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    return { level: 'Low', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' };
  };

  const riskInfo = getRiskLevel(stats.overallRiskScore);

  return (
    <div className="flex-1 overflow-auto bg-slate-50 relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light"></div>
      <Header title="Dashboard Overview" />

      <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto relative z-10">
        {/* Auto-refresh indicator */}
        {advanced.autoRefresh && (
          <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-700 font-medium">Auto-refresh enabled</span>
            </div>
            <span className="text-xs text-blue-600">Last updated: {lastRefresh.toLocaleTimeString()}</span>
          </div>
        )}
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Processed"
            value={stats.totalProcessed}
            icon={<RiMailLine className="w-6 h-6" />}
            iconColor="text-blue-600"
            trend="+8.2%"
            trendUp={true}
          />
          <StatCard
            title="Currently Flagged"
            value={stats.totalFlagged}
            icon={<RiAlertLine className="w-6 h-6" />}
            iconColor="text-red-600"
            trend="+12%"
            trendUp={false}
          />
          <StatCard
            title="Emails Released"
            value={stats.totalReleased}
            icon={<RiShieldCheckLine className="w-6 h-6" />}
            iconColor="text-emerald-600"
            trend="+5.4%"
            trendUp={true}
          />
          <StatCard
            title="Active Keywords"
            value={stats.activeKeywords}
            icon={<RiSpamLine className="w-6 h-6" />}
            iconColor="text-purple-600"
            trend="+2"
            trendUp={true}
          />
        </div>

        {/* Risk Score & Detection Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Risk Score */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
              
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center relative z-10">
                <RiFireLine className="w-4 h-4 mr-2 text-slate-400" />
                Overall Risk Score
              </h3>
              
              <div className="flex flex-col items-center relative z-10">
                {/* Circular Progress */}
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-100 "
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      className={`${riskInfo.color} drop-shadow-md`}
                      strokeDasharray={`${(stats.overallRiskScore / 100) * 251.2} 251.2`}
                      style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">{stats.overallRiskScore}</span>
                    <span className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Score</span>
                  </div>
                </div>

                <div className={`mt-8 px-6 py-2.5 rounded-full border ${riskInfo.bgColor} ${riskInfo.borderColor} shadow-sm`}>
                  <span className={`text-sm font-bold ${riskInfo.color} uppercase tracking-wide flex items-center`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${riskInfo.color.replace('text-', 'bg-')}`}></span>
                    {riskInfo.level} Risk
                  </span>
                </div>

                <p className="text-xs text-slate-500  text-center mt-4 leading-relaxed">
                  Based on {stats.totalFlagged} flagged emails with various threat levels
                </p>
              </div>
            </div>
          </div>

          {/* Threat Breakdown */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 h-full relative overflow-hidden">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Threat Distribution</h3>
              
              <div className="space-y-6">
                {/* Critical */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-700 flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-3 ring-2 ring-red-100"></span>
                      Critical Risk
                    </span>
                    <span className="text-sm font-bold text-slate-900">{stats.criticalCount} emails</span>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-2.5 overflow-hidden ring-1 ring-slate-100">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${stats.totalFlagged > 0 ? (stats.criticalCount / stats.totalFlagged) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* High */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-700 flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-3 ring-2 ring-orange-100"></span>
                      High Risk
                    </span>
                    <span className="text-sm font-bold text-slate-900">{stats.highCount} emails</span>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-2.5 overflow-hidden ring-1 ring-slate-100">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${stats.totalFlagged > 0 ? (stats.highCount / stats.totalFlagged) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-700 flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-3 ring-2 ring-yellow-100"></span>
                      Medium Risk
                    </span>
                    <span className="text-sm font-bold text-slate-900">{stats.mediumCount} emails</span>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-2.5 overflow-hidden ring-1 ring-slate-100">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${stats.totalFlagged > 0 ? (stats.mediumCount / stats.totalFlagged) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Low */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-700 flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-3 ring-2 ring-blue-100"></span>
                      Low Risk
                    </span>
                    <span className="text-sm font-bold text-slate-900">{stats.lowCount} emails</span>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-2.5 overflow-hidden ring-1 ring-slate-100">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${stats.totalFlagged > 0 ? (stats.lowCount / stats.totalFlagged) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Detection Rate */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Detection Rate</span>
                    <p className="text-xs text-slate-400 mt-1">
                      {stats.totalFlagged} of {stats.totalProcessed} emails flagged
                    </p>
                  </div>
                  <span className="text-3xl font-black text-blue-600 tracking-tight">{stats.detectionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Threat Sources */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
              <RiTrophyLine className="w-4 h-4 mr-2 text-slate-400" />
              Top Threat Sources
            </h3>
            
            {stats.topThreats.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <RiShieldCheckLine className="w-16 h-16 mx-auto mb-4 text-emerald-400 opacity-50" />
                <p className="text-sm font-medium">No threats detected</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topThreats.map(([domain, count], index) => (
                  <div key={domain} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-md transition-all duration-300 group cursor-default">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${
                      index === 0 ? 'bg-red-100 text-red-600 ring-1 ring-red-200' :
                      index === 1 ? 'bg-orange-100 text-orange-600 ring-1 ring-orange-200' :
                      index === 2 ? 'bg-yellow-100 text-yellow-600 ring-1 ring-yellow-200' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{domain}</p>
                      <p className="text-xs font-medium text-slate-500">{count} threat{count !== 1 ? 's' : ''} detected</p>
                    </div>
                    <div className="text-sm font-black text-slate-300 group-hover:text-blue-600 transition-colors">
                      {Math.round((count / stats.totalFlagged) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Released Emails */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
              <RiTimeLine className="w-4 h-4 mr-2 text-slate-400" />
              Recent Activity
            </h3>
            
            {stats.recentReleased.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <RiMailLine className="w-16 h-16 mx-auto mb-4 text-slate-300 opacity-50" />
                <p className="text-sm font-medium">No released emails yet</p>
                <p className="text-xs mt-1 opacity-70">Released emails will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentReleased.map((released) => (
                  <div key={released.id} className="p-4 bg-white rounded-xl border border-slate-100 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group cursor-default">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 ring-1 ring-emerald-100 group-hover:scale-110 transition-transform">
                        <RiShieldCheckLine className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{released.originalEmail.subject}</p>
                        <p className="text-xs font-medium text-slate-500 truncate">From: {released.originalEmail.sender}</p>
                        <div className="flex items-center mt-2.5 space-x-4">
                          <div className="flex items-center text-xs font-medium text-slate-400">
                            <RiUserLine className="w-3.5 h-3.5 mr-1.5" />
                            {released.releasedBy}
                          </div>
                          <div className="flex items-center text-xs font-medium text-slate-400">
                            <RiTimeLine className="w-3.5 h-3.5 mr-1.5" />
                            {released.releasedAt}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

