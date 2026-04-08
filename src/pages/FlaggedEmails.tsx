import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/layout/Header';
import StatCard from '../components/common/StatCard';
import EmailDetailModal from '../components/dashboard/EmailDetailModal';
import RoleGate from '../components/common/RoleGate';
import { useEngagementTracker } from '../utils/useEngagementTracker';
import { generatePDFReport } from '../utils/pdfExport';
import {
  filterVisibleFlaggedEmails,
  getVisibleSignals,
  hasVisibleTypoHit,
  hasVisibleKeywordHit
} from '../utils/keywordSignals';
import { RiAlertLine, RiFireLine, RiKeyLine, RiSearchLine, RiSortDesc } from 'react-icons/ri';
import { BiEnvelope } from 'react-icons/bi';

type FilterType = 'All' | 'Keyword' | 'Typo' | 'Both';
type SortType   = 'Risk' | 'Received' | 'Sender' | 'Subject';

const FlaggedEmails: React.FC = () => {
  useEngagementTracker('flagged-emails');
  const { flaggedEmails, keywords, setSelectedEmail, selectedEmail, releaseEmail } = useApp();
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterType, setFilterType]     = useState<FilterType>('All');
  const [sortBy, setSortBy]             = useState<SortType>('Risk');
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 10;

  const visibleFlaggedEmails = useMemo(
    () => filterVisibleFlaggedEmails(flaggedEmails, keywords),
    [flaggedEmails, keywords]
  );

  React.useEffect(() => {
    if (!selectedEmail) return;
    if (!visibleFlaggedEmails.some(e => e.id === selectedEmail.id)) setSelectedEmail(null);
  }, [visibleFlaggedEmails, selectedEmail, setSelectedEmail]);

  const stats = useMemo(() => {
    const totalFlagged  = visibleFlaggedEmails.length;
    const highCritical  = visibleFlaggedEmails.filter(e => e.riskLevel === 'Critical' || e.riskLevel === 'High').length;
    const keywordHits   = visibleFlaggedEmails.filter(e => hasVisibleKeywordHit(e, keywords)).length;
    const typoHits      = visibleFlaggedEmails.filter(e => hasVisibleTypoHit(e, keywords)).length;
    return { totalFlagged, highCritical, keywordHits, typoHits };
  }, [visibleFlaggedEmails, keywords]);

  const filteredEmails = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let filtered = visibleFlaggedEmails.filter(email => {
      const signals = getVisibleSignals(email, keywords);
      if (!query) {
        if (filterType === 'All') return true;
        const hk = signals.some(s => s.type === 'keyword');
        const ht = signals.some(s => s.type === 'typo');
        if (filterType === 'Keyword') return hk && !ht;
        if (filterType === 'Typo')    return ht && !hk;
        if (filterType === 'Both')    return hk && ht;
        return true;
      }
      const matchesSearch = (email.sender?.toLowerCase().includes(query)) ||
                            (email.subject?.toLowerCase().includes(query)) ||
                            signals.some(s => s.value?.toLowerCase().includes(query));
      if (!matchesSearch) return false;
      if (filterType === 'All') return true;
      const hk = signals.some(s => s.type === 'keyword');
      const ht = signals.some(s => s.type === 'typo');
      if (filterType === 'Keyword') return hk && !ht;
      if (filterType === 'Typo')    return ht && !hk;
      if (filterType === 'Both')    return hk && ht;
      return true;
    });

    filtered.sort((a, b) => {
      const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      switch (sortBy) {
        case 'Risk':     return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        case 'Sender':   return a.sender.localeCompare(b.sender);
        case 'Subject':  return a.subject.localeCompare(b.subject);
        case 'Received': return a.received.localeCompare(b.received);
        default:         return 0;
      }
    });
    return filtered;
  }, [visibleFlaggedEmails, keywords, searchQuery, filterType, sortBy]);

  const totalPages      = Math.ceil(filteredEmails.length / itemsPerPage);
  const paginatedEmails = filteredEmails.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);
  const paginationWindow = 5;
  const startPage = Math.max(1, currentPage - Math.floor(paginationWindow/2));
  const endPage   = Math.min(totalPages, startPage + paginationWindow - 1);
  const normStart = Math.max(1, endPage - paginationWindow + 1);
  const visiblePages = Array.from({ length: Math.max(0, endPage-normStart+1) }, (_, i) => normStart + i);

  React.useEffect(() => { setCurrentPage(1); }, [searchQuery, filterType, sortBy]);

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-950/50 text-red-400 border-red-800/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/60';
      case 'High':     return 'bg-orange-950/50 text-orange-400 border-orange-800/60 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800/60';
      case 'Medium':   return 'bg-amber-950/50 text-amber-400 border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/60';
      default:         return 'bg-blue-950/50 text-blue-400 border-blue-800/60 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/60';
    }
  };

  const getRiskBadgeLight = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'High':     return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium':   return 'bg-amber-50 text-amber-700 border-amber-200';
      default:         return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <RoleGate permission="canViewFlaggedEmails">
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#040c18]">
        <Header title="Flagged Emails" showActions onExportPDF={() => generatePDFReport(filteredEmails, keywords)} />

        <div className="p-6 space-y-4 animate-fade-in max-w-5xl mx-auto">

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Flagged"  value={stats.totalFlagged}  icon={<RiAlertLine />}    iconColor="text-red-600"    trend="+12%" trendUp={false} />
            <StatCard title="High/Critical"  value={stats.highCritical}  icon={<RiFireLine />}     iconColor="text-orange-600" trend="+5%"  trendUp={false} />
            <StatCard title="Keyword Hits"   value={stats.keywordHits}   icon={<RiKeyLine />}      iconColor="text-yellow-600" trend="-2%"  trendUp={true} />
            <StatCard title="Typo Hits"      value={stats.typoHits}      icon={<BiEnvelope />}     iconColor="text-blue-600"   trend="+0%"  trendUp={true} />
          </div>

          {/* Main table card */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm dark:bg-[#0a1628] dark:border-[#0f2a4a]">

            {/* Controls bar */}
            <div className="px-4 py-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 dark:border-[#0f2a4a] dark:bg-[#060f1e]">
              <div className="relative flex-1 max-w-sm">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#2a4a6a]" />
                <input
                  type="text" placeholder="Search emails…" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border outline-none transition-all
                             bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                             dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#e2e8f0] dark:focus:border-cyan-500/40"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-lg border overflow-hidden border-slate-200 dark:border-[#1a3554]">
                  {(['All','Keyword','Typo','Both'] as FilterType[]).map(type => (
                    <button key={type} onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors
                                 ${filterType === type
                                   ? 'bg-blue-600 text-white dark:bg-cyan-500 dark:text-[#040c18]'
                                   : 'text-slate-500 hover:bg-slate-50 dark:text-[#4a6080] dark:hover:bg-white/[0.03]'}`}>
                      {type}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <RiSortDesc className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#2a4a6a]" />
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as SortType)}
                    className="pl-8 pr-6 py-1.5 text-xs rounded-lg border appearance-none cursor-pointer outline-none
                               bg-white border-slate-200 text-slate-600
                               dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#94a3b8]">
                    <option value="Risk">Risk Level</option>
                    <option value="Received">Date Received</option>
                    <option value="Sender">Sender</option>
                    <option value="Subject">Subject</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[110px]" /><col className="w-[170px]" /><col className="w-[220px]" />
                  <col className="w-[150px]" /><col className="w-[95px]" /><col className="w-[100px]" />
                </colgroup>
                <thead>
                  <tr className="border-b text-left border-slate-100 bg-slate-50 dark:border-[#0f2a4a] dark:bg-[#060f1e]">
                    {['Received','Sender','Subject','Signals','Risk Level','Actions'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmails.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center">
                        <RiSearchLine className="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-[#0f2040]" />
                        <p className="text-sm font-medium text-slate-700 dark:text-[#4a6080]">No emails found</p>
                        <p className="text-xs text-slate-400 mt-1 dark:text-[#2a4a6a]">Adjust search or filters</p>
                      </td>
                    </tr>
                  ) : paginatedEmails.map((email, idx) => {
                    const signals = getVisibleSignals(email, keywords);
                    const riskDot = email.riskLevel === 'Critical' ? 'bg-red-500 animate-pulse' : email.riskLevel === 'High' ? 'bg-orange-500' : email.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-blue-500';
                    return (
                      <tr key={email.id} onClick={() => setSelectedEmail(email)}
                          className="group border-b cursor-pointer transition-colors
                                     border-slate-100 hover:bg-blue-50/40
                                     dark:border-[#0f2a4a] dark:hover:bg-cyan-500/[0.03]"
                          style={{ animationDelay: `${idx * 40}ms` }}>

                        <td className="px-4 py-3 text-[10px] font-mono text-slate-500 dark:text-[#4a6080]">
                          <span className="line-clamp-2">{email.received}</span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0
                                            bg-slate-100 text-slate-600 dark:bg-[#0f2040] dark:text-[#4a6080]">
                              {email.sender.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-slate-700 font-medium truncate dark:text-[#94a3b8]">{email.sender}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600 font-medium truncate block max-w-[175px] group-hover:text-blue-600 transition-colors dark:text-[#94a3b8] dark:group-hover:text-cyan-400">
                            {email.subject}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 max-w-[130px]">
                            {signals.slice(0, 2).map((signal, i) => (
                              <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border truncate
                                                        ${signal.type === 'keyword'
                                                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                                                          : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/60'}`}>
                                {signal.type === 'keyword' ? <RiKeyLine className="mr-1 w-2.5 h-2.5 flex-shrink-0" /> : <RiAlertLine className="mr-1 w-2.5 h-2.5 flex-shrink-0" />}
                                {signal.value}
                              </span>
                            ))}
                            {signals.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-mono dark:text-[#2a4a6a]">+{signals.length - 2} more</span>
                            )}
                          </div>
                        </td>

                        <td className="px-2 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border font-mono
                                          ${getRiskBadgeLight(email.riskLevel)} dark:${getRiskBadge(email.riskLevel)}`}
                                style={{ border: undefined }}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${riskDot}`} />
                            {email.riskLevel.toUpperCase()}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <button onClick={e => { e.stopPropagation(); releaseEmail(email.id); }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all active:scale-95
                                       bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200
                                       dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#4a6080] dark:hover:text-cyan-400 dark:hover:border-cyan-500/30">
                            Release
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-4 py-3 border-t border-slate-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between dark:border-[#0f2a4a] dark:bg-[#060f1e]">
              <p className="text-xs font-mono text-slate-400 dark:text-[#2a4a6a]">
                {(currentPage-1)*itemsPerPage+1}–{Math.min(currentPage*itemsPerPage, filteredEmails.length)} of {filteredEmails.length}
              </p>
              <div className="flex items-center space-x-1.5 overflow-x-auto">
                {[
                  { label: '← Prev', disabled: currentPage === 1, action: () => setCurrentPage(p => Math.max(1, p-1)) },
                ].map(b => (
                  <button key={b.label} onClick={b.action} disabled={b.disabled}
                    className="px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors disabled:opacity-40
                               bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#4a6080] dark:hover:bg-[#0a1628]">
                    {b.label}
                  </button>
                ))}
                {normStart > 1 && <button onClick={() => setCurrentPage(1)} className="w-8 h-8 text-xs rounded-lg border bg-white border-slate-200 text-slate-600 dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#4a6080]">1</button>}
                {normStart > 2  && <span className="text-slate-400 text-xs dark:text-[#2a4a6a]">…</span>}
                {visiblePages.map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 text-xs rounded-lg border font-medium transition-colors
                               ${currentPage === p
                                 ? 'bg-blue-600 text-white border-blue-600 dark:bg-cyan-500 dark:text-[#040c18] dark:border-cyan-500'
                                 : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#4a6080]'}`}>
                    {p}
                  </button>
                ))}
                {endPage < totalPages - 1 && <span className="text-slate-400 text-xs dark:text-[#2a4a6a]">…</span>}
                {endPage < totalPages && <button onClick={() => setCurrentPage(totalPages)} className="w-8 h-8 text-xs rounded-lg border bg-white border-slate-200 text-slate-600 dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#4a6080]">{totalPages}</button>}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages || filteredEmails.length === 0}
                  className="px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors disabled:opacity-40
                             bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#4a6080] dark:hover:bg-[#0a1628]">
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>

        <EmailDetailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      </div>
    </RoleGate>
  );
};

export default FlaggedEmails;
