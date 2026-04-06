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
type SortType = 'Risk' | 'Received' | 'Sender' | 'Subject';

const FlaggedEmails: React.FC = () => {
  useEngagementTracker('flagged-emails');
  const { flaggedEmails, keywords, setSelectedEmail, selectedEmail, releaseEmail } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('All');
  const [sortBy, setSortBy] = useState<SortType>('Risk');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const visibleFlaggedEmails = useMemo(
    () => filterVisibleFlaggedEmails(flaggedEmails, keywords),
    [flaggedEmails, keywords]
  );

  React.useEffect(() => {
    if (!selectedEmail) return;
    if (!visibleFlaggedEmails.some(e => e.id === selectedEmail.id)) {
      setSelectedEmail(null);
    }
  }, [visibleFlaggedEmails, selectedEmail, setSelectedEmail]);

  // Calculate statistics (respects enabled keywords only)
  const stats = useMemo(() => {
    const totalFlagged = visibleFlaggedEmails.length;
    const highCritical = visibleFlaggedEmails.filter(e =>
      e.riskLevel === 'Critical' || e.riskLevel === 'High'
    ).length;
    const keywordHits = visibleFlaggedEmails.filter(e => hasVisibleKeywordHit(e, keywords)).length;
    const typoHits = visibleFlaggedEmails.filter(e => hasVisibleTypoHit(e, keywords)).length;

    return { totalFlagged, highCritical, keywordHits, typoHits };
  }, [visibleFlaggedEmails, keywords]);

  // Filter and sort emails (same logic)
  const filteredEmails = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = visibleFlaggedEmails.filter(email => {
      const visibleSignals = getVisibleSignals(email, keywords);
      // If no query, skip search check
      if (!query) {
        if (filterType === 'All') return true;
        const hasKeyword = visibleSignals.some(s => s.type === 'keyword');
        const hasTypo = visibleSignals.some(s => s.type === 'typo');
        if (filterType === 'Keyword') return hasKeyword && !hasTypo;
        if (filterType === 'Typo') return hasTypo && !hasKeyword;
        if (filterType === 'Both') return hasKeyword && hasTypo;
        return true;
      }

      const matchesSearch = 
        (email.sender && email.sender.toLowerCase().includes(query)) ||
        (email.subject && email.subject.toLowerCase().includes(query)) ||
        (visibleSignals.some(s => s.value && s.value.toLowerCase().includes(query)));

      if (!matchesSearch) return false;

      if (filterType === 'All') return true;
      
      const hasKeyword = visibleSignals.some(s => s.type === 'keyword');
      const hasTypo = visibleSignals.some(s => s.type === 'typo');

      if (filterType === 'Keyword') return hasKeyword && !hasTypo;
      if (filterType === 'Typo') return hasTypo && !hasKeyword;
      if (filterType === 'Both') return hasKeyword && hasTypo;

      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Risk': {
          const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        }
        case 'Sender':
          return a.sender.localeCompare(b.sender);
        case 'Subject':
          return a.subject.localeCompare(b.subject);
        case 'Received':
          return a.received.localeCompare(b.received);
        default:
          return 0;
      }
    });

    return filtered;
  }, [visibleFlaggedEmails, keywords, searchQuery, filterType, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const paginationWindow = 5;
  const startPage = Math.max(1, currentPage - Math.floor(paginationWindow / 2));
  const endPage = Math.min(totalPages, startPage + paginationWindow - 1);
  const normalizedStartPage = Math.max(1, endPage - paginationWindow + 1);
  const visiblePages = Array.from(
    { length: Math.max(0, endPage - normalizedStartPage + 1) },
    (_, i) => normalizedStartPage + i
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, sortBy]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/45 dark:border-red-900/60';
      case 'High':
        return 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/45 dark:border-orange-900/60';
      case 'Medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-950/45 dark:border-yellow-900/60';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/45 dark:border-blue-900/60';
    }
  };

  const handleExportPDF = () => {
    generatePDFReport(filteredEmails, keywords);
  };

  return (
    <RoleGate permission="canViewFlaggedEmails">
    <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-[#0f172a]">
      <Header title="Flagged Emails" showActions onExportPDF={handleExportPDF} />

      <div className="p-8 space-y-4 animate-fade-in max-w-5xl mx-auto">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Flagged"
            value={stats.totalFlagged}
            icon={<RiAlertLine className="w-6 h-6" />}
            iconColor="text-red-600"
            trend="+12%"
            trendUp={false} // Red trend implies increase in threats
          />
          <StatCard
            title="High/Critical"
            value={stats.highCritical}
            icon={<RiFireLine className="w-6 h-6" />}
            iconColor="text-orange-600"
            trend="+5%"
            trendUp={false}
          />
          <StatCard
            title="Keyword Hits"
            value={stats.keywordHits}
            icon={<RiKeyLine className="w-6 h-6" />}
            iconColor="text-yellow-600"
            trend="-2%"
            trendUp={true} // Decrease is good
          />
          <StatCard
            title="Typo Hits"
            value={stats.typoHits}
            icon={<BiEnvelope className="w-6 h-6" />}
            iconColor="text-blue-600"
            trend="+0%"
            trendUp={true}
          />
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg border border-white/50 shadow-xl shadow-slate-200/50 overflow-hidden dark:bg-[#1e293b] dark:border-[#334155] dark:shadow-black/30">
          
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:border-[#334155] dark:bg-[#1e293b]">
            {/* Search */}
            <div className="relative flex-1 max-w-md group">
              <RiSearchLine className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors dark:text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-sm dark:bg-[#243247] dark:border-[#334155] dark:text-[#f8fafc] dark:placeholder:text-[#94a3b8]"
              />
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 dark:bg-[#243247] dark:border-[#334155]">
                {(['All', 'Keyword', 'Typo', 'Both'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filterType === type
                        ? 'bg-white text-blue-600 shadow-sm shadow-slate-200 dark:bg-[#1e293b] dark:text-blue-400'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:text-[#94a3b8] dark:hover:text-[#cbd5e1] dark:hover:bg-[#1e293b]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block dark:bg-[#334155]"></div>

              <div className="relative group">
                <RiSortDesc className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94a3b8]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-50 transition-all shadow-sm dark:bg-[#243247] dark:border-[#334155] dark:text-[#cbd5e1] dark:hover:bg-[#1e293b]"
                >
                  <option value="Risk">Risk Level</option>
                  <option value="Received">Date Received</option>
                  <option value="Sender">Sender</option>
                  <option value="Subject">Subject</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[118px]" />
                <col className="w-[178px]" />
                <col className="w-[228px]" />
                <col className="w-[148px]" />
                <col className="w-[100px]" />
                <col className="w-[108px]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-50/80 text-left border-b border-slate-200/60 dark:bg-[#243247] dark:border-[#334155]">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-[#94a3b8]">Received</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-[#94a3b8]">Sender</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-[#94a3b8]">Subject</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-[#94a3b8]">Signals</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-[#94a3b8]">Risk Level</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-[#94a3b8]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                {paginatedEmails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-[#94a3b8]">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 dark:bg-[#243247]">
                          <RiSearchLine className="w-8 h-8 text-slate-400 dark:text-[#94a3b8]" />
                        </div>
                        <p className="text-lg font-medium text-slate-900 dark:text-[#f8fafc]">No emails found</p>
                        <p className="text-sm text-slate-500 mt-1 dark:text-[#94a3b8]">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEmails.map((email, index) => {
                    const visibleSignals = getVisibleSignals(email, keywords);
                    return (
                    <tr
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className="group hover:bg-blue-50/40 cursor-pointer transition-colors duration-200 dark:hover:bg-[#243247]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-3 py-3 text-xs leading-snug text-slate-600 font-medium dark:text-[#cbd5e1]">
                        <span className="line-clamp-2 break-words" title={email.received}>
                          {email.received}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm border border-white dark:from-[#243247] dark:to-[#243247] dark:border-[#334155] dark:text-[#cbd5e1]">
                            {email.sender.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-slate-900 truncate max-w-[130px] dark:text-[#f8fafc]">
                            {email.sender}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          title={email.subject}
                          className="text-sm text-slate-600 font-medium truncate whitespace-nowrap max-w-[175px] group-hover:text-blue-600 transition-colors dark:text-[#cbd5e1] dark:group-hover:text-blue-400"
                        >
                          {email.subject}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1 max-w-[132px]">
                          {visibleSignals.slice(0, 2).map((signal, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex max-w-full items-center px-2.5 py-1 rounded-md text-xs font-medium border shadow-sm truncate ${
                                signal.type === 'keyword'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/45 dark:text-amber-300 dark:border-amber-900/60'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/45 dark:text-indigo-300 dark:border-indigo-900/60'
                              }`}
                              title={signal.value}
                            >
                              {signal.type === 'keyword' ? <RiKeyLine className="mr-1 w-3 h-3" /> : <RiAlertLine className="mr-1 w-3 h-3" />}
                              {signal.value}
                            </span>
                          ))}
                          {visibleSignals.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-[#243247] dark:text-[#94a3b8] dark:border-[#334155]">
                              +{visibleSignals.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center max-w-full px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${getRiskColor(email.riskLevel)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            email.riskLevel === 'Critical' ? 'bg-red-500 animate-pulse' : 
                            email.riskLevel === 'High' ? 'bg-orange-500' :
                            email.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></span>
                          {email.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            releaseEmail(email.id);
                          }}
                          className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 shadow-sm active:scale-95 dark:bg-[#243247] dark:border-[#334155] dark:text-[#cbd5e1] dark:hover:bg-[#1e293b] dark:hover:text-blue-400"
                        >
                          Release
                        </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer / Pagination */}
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200/60 flex flex-col gap-3 md:flex-row md:items-center md:justify-between dark:bg-[#243247] dark:border-[#334155]">
            <p className="text-sm text-slate-500 dark:text-[#94a3b8]">
              Showing <span className="font-medium text-slate-900 dark:text-[#f8fafc]">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredEmails.length)}</span> of <span className="font-medium text-slate-900 dark:text-[#f8fafc]">{filteredEmails.length}</span> results
            </p>
            <div className="flex items-center space-x-2 overflow-x-auto">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm shadow-sm transition-all ${
                  currentPage === 1 
                    ? 'text-slate-400 cursor-not-allowed dark:text-[#64748b]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 dark:text-[#cbd5e1] dark:bg-[#1e293b] dark:border-[#334155] dark:hover:bg-[#243247] dark:hover:text-blue-400'
                }`}
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {normalizedStartPage > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="w-10 h-10 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-200 dark:bg-[#1e293b] dark:border-[#334155] dark:text-[#cbd5e1] dark:hover:bg-[#243247]"
                    >
                      1
                    </button>
                    {normalizedStartPage > 2 && (
                      <span className="px-1 text-slate-400 dark:text-[#94a3b8]">...</span>
                    )}
                  </>
                )}
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-200 dark:bg-[#1e293b] dark:border-[#334155] dark:text-[#cbd5e1] dark:hover:bg-[#243247]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && (
                      <span className="px-1 text-slate-400 dark:text-[#94a3b8]">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-10 h-10 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-200 dark:bg-[#1e293b] dark:border-[#334155] dark:text-[#cbd5e1] dark:hover:bg-[#243247]"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || filteredEmails.length === 0}
                className={`px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm shadow-sm transition-all ${
                  currentPage === totalPages || filteredEmails.length === 0
                    ? 'text-slate-400 cursor-not-allowed dark:text-[#64748b]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 dark:text-[#cbd5e1] dark:bg-[#1e293b] dark:border-[#334155] dark:hover:bg-[#243247] dark:hover:text-blue-400'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <EmailDetailModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
    </div>
    </RoleGate>
  );
};

export default FlaggedEmails;
