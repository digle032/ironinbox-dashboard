import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RiMailLine } from 'react-icons/ri';

interface SetMonitoredEmailModalProps {
  suggestedEmail?: string;
}

const SetMonitoredEmailModal: React.FC<SetMonitoredEmailModalProps> = ({ suggestedEmail }) => {
  const navigate = useNavigate();
  const { completeNewUserSetup } = useAuth();
  const [email, setEmail] = useState(suggestedEmail || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter an email address to monitor.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    completeNewUserSetup(trimmed);
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-card p-8 max-w-md w-full mx-4 animate-fade-in">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Which email would you like to monitor?</h2>
        <p className="text-sm text-slate-600 mb-6">
          Enter the email address that the dashboard will monitor for flagged and released messages.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email to monitor</label>
            <div className="relative">
              <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="inbox@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetMonitoredEmailModal;
