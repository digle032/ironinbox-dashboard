import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/layout/Header';
import { 
  RiMailLine, 
  RiMailOpenLine, 
  RiSearchLine, 
  RiTimeLine,
  RiUserLine,
  RiShieldCheckLine,
  RiAlertLine,
  RiInboxLine,
  RiCalendarLine
} from 'react-icons/ri';

type FilterType = 'All' | 'Today' | 'This Week' | 'This Month';

const Inbox: React.FC = () => {
  const { releasedEmails } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('All');
  const [selectedEmail, setSelectedEmail] = useState<typeof releasedEmails[0] | null>(null);

  // Filter released emails
  const filteredEmails = useMemo(() => {
    let filtered = releasedEmails.filter(released => {
      const matchesSearch = 
        released.originalEmail.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        released.originalEmail.subject.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Time-based filters (simplified - you can enhance this)
      if (filterType === 'All') return true;
      
      // For demo purposes, all emails pass these filters
      // In production, you'd compare dates properly
      return true;
    });

    return filtered;
  }, [releasedEmails, searchQuery, filterType]);

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50">
      <Header title="Inbox" />

      <div className="p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg shadow-slate-200/50 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <RiMailLine className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Released</p>
                <p className="text-2xl font-extrabold text-slate-900">{releasedEmails.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg shadow-slate-200/50 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <RiShieldCheckLine className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Cleared Today</p>
                <p className="text-2xl font-extrabold text-slate-900">{releasedEmails.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg shadow-slate-200/50 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <RiMailOpenLine className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Safe to View</p>
                <p className="text-2xl font-extrabold text-slate-900">{filteredEmails.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-slate-200/50 overflow-hidden">
              {/* Search & Filters */}
              <div className="p-6 border-b border-slate-100 bg-white/40 space-y-4">
                <div className="relative group">
                  <RiSearchLine className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search released emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-sm"
                  />
                </div>

                <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
                  {(['All', 'Today', 'This Week', 'This Month'] as FilterType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`flex-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        filterType === type
                          ? 'bg-white text-blue-600 shadow-sm shadow-slate-200'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email List */}
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {filteredEmails.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RiInboxLine className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Released Emails</h3>
                    <p className="text-sm text-slate-500">
                      Released emails from the Flagged Emails page will appear here
                    </p>
                  </div>
                ) : (
                  filteredEmails.map((released) => (
                    <div
                      key={released.id}
                      onClick={() => setSelectedEmail(released)}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50/40 ${
                        selectedEmail?.id === released.id ? 'bg-blue-50/60 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white">
                          <span className="text-sm font-bold text-emerald-700">
                            {released.originalEmail.sender.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm font-bold text-slate-900 truncate pr-2">
                              {released.originalEmail.sender}
                            </h4>
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {released.releasedAt}
                            </span>
                          </div>

                          <p className="text-sm font-medium text-slate-700 truncate mb-2">
                            {released.originalEmail.subject}
                          </p>

                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <RiShieldCheckLine className="w-3 h-3 mr-1" />
                              Released
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRiskBadgeColor(released.originalEmail.riskLevel)}`}>
                              Was: {released.originalEmail.riskLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Email Detail Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-slate-200/50 p-6 sticky top-24">
              {selectedEmail ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                      <RiShieldCheckLine className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Email Details</h3>
                      <p className="text-xs text-emerald-600 font-medium">Cleared for Inbox</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Subject</label>
                      <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                        {selectedEmail.originalEmail.subject}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center">
                        <RiUserLine className="w-3 h-3 mr-1" />
                        From
                      </label>
                      <p className="text-sm text-slate-700 font-medium">
                        {selectedEmail.originalEmail.sender}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center">
                        <RiCalendarLine className="w-3 h-3 mr-1" />
                        Received
                      </label>
                      <p className="text-sm text-slate-700">
                        {selectedEmail.originalEmail.received}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Original Risk Assessment</label>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getRiskBadgeColor(selectedEmail.originalEmail.riskLevel)}`}>
                          {selectedEmail.originalEmail.riskLevel.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500">
                          {selectedEmail.originalEmail.signals.length} signal{selectedEmail.originalEmail.signals.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block flex items-center">
                        <RiTimeLine className="w-3 h-3 mr-1" />
                        Release Information
                      </label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Released By:</span>
                          <span className="font-semibold text-slate-900">{selectedEmail.releasedBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Released At:</span>
                          <span className="font-semibold text-slate-900">{selectedEmail.releasedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Detection Signals</label>
                      <div className="space-y-2">
                        {selectedEmail.originalEmail.signals.map((signal, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg text-xs ${
                              signal.type === 'keyword'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                            }`}
                          >
                            <div className="font-bold uppercase tracking-wide mb-1">
                              {signal.type === 'keyword' ? '🔑 Keyword' : '⚠️ Typo'}
                            </div>
                            <div className="font-medium">{signal.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RiMailOpenLine className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">No Email Selected</h3>
                  <p className="text-xs text-slate-500">
                    Click on an email to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
