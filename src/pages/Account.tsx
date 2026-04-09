import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { RiAddLine, RiUserLine } from 'react-icons/ri';

const Account: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[var(--dm-bg-page)]">
      <Header title="Account" />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm dark:bg-[var(--dm-surface-card)] dark:border-[var(--dm-border)]">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center dark:bg-blue-500/10">
              <RiUserLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[var(--dm-text-primary)]">Add Another Account</h2>
              <p className="text-xs text-slate-400 mt-1 dark:text-[var(--dm-text-muted)]">
                Connect another inbox to monitor for phishing threats.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors
                       bg-blue-600 text-white hover:bg-blue-700 shadow-sm
                       dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500"
          >
            <RiAddLine className="w-4 h-4" />
            Add another account
          </button>
          <p className="mt-3 text-xs text-slate-400 dark:text-[var(--dm-text-muted)]">
            This will take you to the sign-in page to connect another inbox.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Account;
