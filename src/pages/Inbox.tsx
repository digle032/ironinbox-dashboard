import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/layout/Header';
import {
  RiMailLine,
  RiMailOpenLine,
  RiSearchLine,
  RiTimeLine,
  RiUserLine,
  RiShieldCheckLine,
  RiInboxLine,
  RiCalendarLine,
  RiStarLine,
  RiStarFill,
  RiFlagLine,
  RiCheckLine
} from 'react-icons/ri';

type TimeFilterType = 'All' | 'Today' | 'This Week' | 'This Month';
type FolderType = 'All' | 'Starred' | 'Unread';

const ITEMS_PER_PAGE = 10;

const Inbox: React.FC = () => {
  const {
    releasedEmails,
    toggleStarReleasedEmail,
    toggleReadReleasedEmail,
    reFlagReleasedEmails
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('All');
  const [folder, setFolder] = useState<FolderType>('All');
  const [selectedEmail, setSelectedEmail] = useState<typeof releasedEmails[0] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const filteredEmails = useMemo(() => {
    let filtered = releasedEmails.filter(released => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        released.originalEmail.sender.toLowerCase().includes(q) ||
        released.originalEmail.subject.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (folder === 'Starred' && !released.starred) return false;
      if (folder === 'Unread' && released.isRead) return false;

      // Time-based filters (simple demo logic based on releasedAt)
      if (timeFilter === 'All') return true;

      // releasedAt is a locale string; this is intentionally forgiving for demo data
      const releasedDate = new Date(released.releasedAt);
      const now = new Date();

      if (timeFilter === 'Today') {
        return releasedDate.toDateString() === now.toDateString();
      }

      if (timeFilter === 'This Week') {
        const diffDays = (now.getTime() - releasedDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }

      if (timeFilter === 'This Month') {
        return (
          releasedDate.getFullYear() === now.getFullYear() &&
          releasedDate.getMonth() === now.getMonth()
        );
      }

      return true;
    });

    return filtered;
  }, [releasedEmails, searchQuery, timeFilter, folder]);

  const totalPages = Math.max(1, Math.ceil(filteredEmails.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredEmails.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEmails, page]);

  const allVisibleSelected = paginated.length > 0 && paginated.every(e => selectedIds.has(e.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        paginated.forEach(e => next.delete(e.id));
      } else {
        paginated.forEach(e => next.add(e.id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkSetRead = (read: boolean) => {
    Array.from(selectedIds).forEach(id => toggleReadReleasedEmail(id, read));
    clearSelection();
  };

  const bulkToggleStar = () => {
    Array.from(selectedIds).forEach(id => toggleStarReleasedEmail(id));
    clearSelection();
  };

  const bulkReFlag = () => {
    reFlagReleasedEmails(Array.from(selectedIds));
    setSelectedEmail(null);
    clearSelection();
  };

  // Keep pagination sane when filters change
  React.useEffect(() => {
    setPage(1);
    clearSelection();
    setSelectedEmail(null);
  }, [searchQuery, timeFilter, folder]);

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Inbox" />

      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by sender or subject..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center space-x-2">
                <RiInboxLine className="text-gray-400 w-5 h-5" />
                <select
                  value={folder}
                  onChange={(e) => setFolder(e.target.value as FolderType)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All</option>
                  <option value="Starred">Starred</option>
                  <option value="Unread">Unread</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <RiTimeLine className="text-gray-400 w-5 h-5" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as TimeFilterType)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All time</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This week</option>
                  <option value="This Month">This month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="inline-flex items-center space-x-2 text-sm text-gray-700 select-none">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span>Select page</span>
              {selectedIds.size > 0 && (
                <span className="text-gray-500">({selectedIds.size} selected)</span>
              )}
            </label>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={bulkToggleStar}
                disabled={selectedIds.size === 0}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
              >
                <RiStarLine className="w-4 h-4" />
                Star/Unstar
              </button>

              <button
                onClick={() => bulkSetRead(true)}
                disabled={selectedIds.size === 0}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
              >
                <RiCheckLine className="w-4 h-4" />
                Mark read
              </button>

              <button
                onClick={() => bulkSetRead(false)}
                disabled={selectedIds.size === 0}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Mark unread
              </button>

              <button
                onClick={bulkReFlag}
                disabled={selectedIds.size === 0}
                className="px-3 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                title="Move back to Flagged Emails"
              >
                <RiFlagLine className="w-4 h-4" />
                Re-flag
              </button>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Released Emails ({filteredEmails.length})
            </h2>
          </div>

          {filteredEmails.length === 0 ? (
            <div className="p-12 text-center">
              <RiMailLine className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No emails found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginated.map((released) => {
                const isSelected = selectedIds.has(released.id);
                const isActive = selectedEmail?.id === released.id;

                return (
                  <div
                    key={released.id}
                    className={`flex items-start gap-3 px-6 py-4 hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(released.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300"
                    />

                    <button
                      onClick={() => setSelectedEmail(released)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                            <RiUserLine className="w-5 h-5 text-emerald-600" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`text-sm truncate ${released.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                                {released.originalEmail.sender}
                              </h3>
                              {released.starred && (
                                <RiStarFill className="w-4 h-4 text-amber-500" />
                              )}
                            </div>

                            <p className={`text-sm truncate ${released.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                              {released.originalEmail.subject}
                            </p>

                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <RiCalendarLine className="w-4 h-4" />
                                <span>{released.releasedAt}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <RiShieldCheckLine className="w-4 h-4" />
                                <span>Released by {released.releasedBy}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleStarReleasedEmail(released.id);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title={released.starred ? 'Unstar' : 'Star'}
                          >
                            {released.starred ? (
                              <RiStarFill className="w-5 h-5 text-amber-500" />
                            ) : (
                              <RiStarLine className="w-5 h-5 text-gray-400" />
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleReadReleasedEmail(released.id);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title={released.isRead ? 'Mark unread' : 'Mark read'}
                          >
                            {released.isRead ? (
                              <RiMailLine className="w-5 h-5 text-gray-400" />
                            ) : (
                              <RiMailOpenLine className="w-5 h-5 text-blue-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {filteredEmails.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        {selectedEmail && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Email Details</h3>
              <span className="text-sm text-gray-500">Released • {selectedEmail.releasedAt}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <p className="text-gray-900">{selectedEmail.originalEmail.sender}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="text-gray-900">{selectedEmail.originalEmail.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Released By</label>
                <p className="text-gray-900">{selectedEmail.releasedBy}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-800 text-sm leading-relaxed">
                  {selectedEmail.originalEmail.content}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
