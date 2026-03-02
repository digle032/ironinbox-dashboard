import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import SetMonitoredEmailModal from './SetMonitoredEmailModal';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const { isNewUser, user } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-72 bg-slate-50 overflow-auto">
        <Outlet />
      </div>
      {isNewUser && user?.email && (
        <SetMonitoredEmailModal suggestedEmail={user.email} />
      )}
    </div>
  );
};

export default DashboardLayout;
