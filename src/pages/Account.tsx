import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';

const Account: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-auto dark:bg-[#0f172a]">
      <Header title="Account" />

      <div className="p-8 max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-[#334155] dark:bg-[#1e293b]">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-[#f8fafc]">Add Another Account</h2>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Add another account
          </button>
          <p className="mt-4 text-sm text-slate-500 dark:text-[#94a3b8]">
            This will take you to the sign-in page to connect another inbox.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Account;

