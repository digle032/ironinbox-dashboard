import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import {
  RiBellLine,
  RiFileDownloadLine,
  RiAlertLine,
  RiInboxLine,
  RiShieldCheckLine,
  RiSearchEyeLine,
  RiLockLine,
} from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showActions?: boolean;
  onExportPDF?: () => void;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'incident' | 'inbox' | 'flagged' | 'monitoring' | 'privacy';
  link: string;
  read: boolean;
  time: string;
}

const Header: React.FC<HeaderProps> = ({ title, showActions = false, onExportPDF }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { profile } = useSettings();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: 'New Incident Reported', message: 'A suspicious email request was escalated for review.', type: 'incident', link: '/incidents', read: false, time: '2 min ago' },
    { id: 2, title: 'Inbox Activity Detected', message: '12 new monitored emails have been received.', type: 'inbox', link: '/inbox', read: false, time: '8 min ago' },
    { id: 3, title: 'Email Flagged', message: 'A high-risk email was added to the flagged queue.', type: 'flagged', link: '/flagged-emails', read: false, time: '15 min ago' },
    { id: 4, title: 'Keyword Match Found', message: 'A monitored keyword triggered a new alert.', type: 'monitoring', link: '/keyword-monitoring', read: true, time: '1 hour ago' },
    { id: 5, title: 'Access Policy Updated', message: 'A new privacy control setting requires review.', type: 'privacy', link: '/privacy-access-control', read: true, time: 'Today' },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: NotificationItem) => {
    setNotifications((prev) => prev.map((n) => n.id === notification.id ? { ...n, read: true } : n));
    setShowDropdown(false);
    navigate(notification.link);
  };

  const markAllAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'incident':   return <RiAlertLine className="w-3.5 h-3.5 text-red-400" />;
      case 'inbox':      return <RiInboxLine className="w-3.5 h-3.5 text-blue-400 dark:text-cyan-400" />;
      case 'flagged':    return <RiShieldCheckLine className="w-3.5 h-3.5 text-amber-400" />;
      case 'monitoring': return <RiSearchEyeLine className="w-3.5 h-3.5 text-indigo-400" />;
      case 'privacy':    return <RiLockLine className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-40 px-8 py-3.5 transition-all duration-200
                    bg-white/95 border-b border-slate-200 shadow-sm
                    dark:bg-[#060f1e]/95 dark:border-[#0f2a4a] dark:shadow-none dark:backdrop-blur-none">

      {/* Dark mode: subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px hidden dark:block
                      bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="flex items-center justify-between gap-4">
        {/* Page Title */}
        <div>
          <div className="flex items-center space-x-2 mb-0.5">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-blue-600 transition-colors
                         dark:text-[#2a4a6a] dark:hover:text-cyan-400 dark:font-mono"
            >
              Home
            </button>
            <span className="text-slate-300 dark:text-[#1a3554] text-[10px]">/</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400 dark:font-mono">
              {title}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none dark:text-[#e2e8f0]">
            {title}
          </h1>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-1.5">
          {showActions && (
            <button
              onClick={onExportPDF}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                         bg-slate-900 text-white hover:bg-slate-700 shadow-sm
                         dark:bg-[#0f2040] dark:text-[#94a3b8] dark:border dark:border-[#0f2a4a] dark:hover:text-[#e2e8f0] dark:hover:border-cyan-500/30"
            >
              <RiFileDownloadLine className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="relative p-2 rounded-lg transition-all duration-200
                         text-slate-500 hover:text-slate-900 hover:bg-slate-100
                         dark:text-[#4a6080] dark:hover:text-[#e2e8f0] dark:hover:bg-white/[0.04]"
            >
              <RiBellLine className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold text-white bg-red-500 rounded-full border border-white dark:border-[#060f1e]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            <div className={`absolute right-0 mt-2 w-88 rounded-xl border shadow-2xl overflow-hidden z-50 transition-all duration-200
                            bg-white border-slate-200 shadow-slate-200/60
                            dark:bg-[#0a1628] dark:border-[#0f2a4a] dark:shadow-black/60
                            ${showDropdown ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                 style={{ width: '360px' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#0f2a4a] dark:bg-[#060f1e]">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e2e8f0]">Alerts</h3>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-[#2a4a6a] mt-px">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors
                               border-slate-100 hover:bg-slate-50
                               dark:border-[#0f2a4a] dark:hover:bg-white/[0.02]
                               ${!notification.read ? 'bg-blue-50/40 dark:bg-cyan-500/[0.04]' : 'bg-white dark:bg-transparent'}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-1.5 rounded-md flex-shrink-0 bg-slate-100 dark:bg-[#0f2040]">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-[#e2e8f0] truncate">{notification.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap dark:text-[#2a4a6a] font-mono">{notification.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 dark:text-[#4a6080] line-clamp-1">{notification.message}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-blue-600 font-medium dark:text-cyan-400">View →</span>
                          {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-cyan-400" />}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-[#0f2a4a]" />

          {/* Profile avatar */}
          <button
            onClick={() => navigate('/account')}
            className="p-0.5 rounded-full border border-transparent hover:border-slate-200 transition-colors dark:hover:border-[#0f2a4a]"
          >
            <img
              src={profile.avatar}
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-[#0f2a4a]"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
