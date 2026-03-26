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

const Header: React.FC<HeaderProps> = ({
  title,
  showActions = false,
  onExportPDF,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { profile } = useSettings();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: 'New Incident Reported',
      message: 'A suspicious email request was escalated for review.',
      type: 'incident',
      link: '/incidents',
      read: false,
      time: '2 min ago',
    },
    {
      id: 2,
      title: 'Inbox Activity Detected',
      message: '12 new monitored emails have been received.',
      type: 'inbox',
      link: '/inbox',
      read: false,
      time: '8 min ago',
    },
    {
      id: 3,
      title: 'Email Flagged',
      message: 'A high-risk email was added to the flagged queue.',
      type: 'flagged',
      link: '/flagged-emails',
      read: false,
      time: '15 min ago',
    },
    {
      id: 4,
      title: 'Keyword Match Found',
      message: 'A monitored keyword triggered a new alert.',
      type: 'monitoring',
      link: '/keyword-monitoring',
      read: true,
      time: '1 hour ago',
    },
    {
      id: 5,
      title: 'Access Policy Updated',
      message: 'A new privacy control setting requires review.',
      type: 'privacy',
      link: '/privacy-access-control',
      read: true,
      time: 'Today',
    },
  ]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item
      )
    );

    setShowDropdown(false);
    navigate(notification.link);
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read: true }))
    );
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'incident':
        return <RiAlertLine className="w-4 h-4 text-red-500" />;
      case 'inbox':
        return <RiInboxLine className="w-4 h-4 text-blue-600" />;
      case 'flagged':
        return <RiShieldCheckLine className="w-4 h-4 text-amber-500" />;
      case 'monitoring':
        return <RiSearchEyeLine className="w-4 h-4 text-indigo-500" />;
      case 'privacy':
        return <RiLockLine className="w-4 h-4 text-emerald-500" />;
      default:
        return <RiBellLine className="w-4 h-4 text-slate-500" />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-white/50 shadow-sm shadow-slate-200/40 px-8 py-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Page Title & Breadcrumbs */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            <button
              onClick={() => navigate('/dashboard')}
                className="hover:text-blue-500 transition-colors"
                >
                 Home
                </button>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600">{title}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            {title}
          </h1>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {showActions && (
            <div className="flex items-center space-x-3 mr-2 border-r border-slate-200 pr-6">
              <button
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white hover:bg-blue-600 rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 active:scale-95 text-sm font-medium group"
              >
                <RiFileDownloadLine className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span>Export Report</span>
              </button>
            </div>
          )}

          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group"
            >
              <RiBellLine className="w-5 h-5 transition-transform group-hover:rotate-12" />

              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            <div
              className={`absolute right-0 mt-3 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden z-50 transition-all duration-200 ${
                showDropdown
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notifications
                  </h3>
                  <p className="text-xs text-slate-500">
                    {unreadCount} unread
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors ${
                      !notification.read ? 'bg-blue-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 p-2 rounded-xl bg-slate-100">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {notification.title}
                          </p>
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">
                            {notification.time}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 mt-1">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-blue-600 font-medium">
                            Open page
                          </span>

                          {!notification.read && (
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200/60"></div>

          {/* User Profile Mini */}
          <div className="relative group">
            <button
              className="flex items-center space-x-2 p-1 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all duration-200"
            >
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-9 h-9 rounded-full shadow-sm ring-2 ring-white object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;