import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import SetMonitoredEmailModal from './SetMonitoredEmailModal';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../utils/useRole';

const DashboardLayout: React.FC = () => {
  const { isNewUser, user } = useAuth();
  const { hasPermission } = useRole();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#040c18]">
      <Sidebar
        canViewInbox={hasPermission('canViewInbox')}
        canViewFlaggedEmails={hasPermission('canViewFlaggedEmails')}
        canViewKeywordMonitoring={hasPermission('canViewKeywordMonitoring')}
      />
      <div className="flex-1 ml-72 bg-slate-50 dark:bg-[#040c18] overflow-auto">
        <Outlet />
      </div>
      {isNewUser && user?.email && (
        <SetMonitoredEmailModal suggestedEmail={user.email} />
      )}
    </div>
  );
};

export default DashboardLayout;
