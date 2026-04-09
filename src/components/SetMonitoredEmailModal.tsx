import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RiMailLine, RiShieldCheckLine } from 'react-icons/ri';

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
    if (!trimmed) { setError('Please enter an email address to monitor.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Please enter a valid email address.'); return; }
    completeNewUserSetup(trimmed);
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-fade-in">

      {/* Glow (dark) */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block
                      bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),transparent_70%)]" />

      <div className="relative w-full max-w-sm rounded-xl border shadow-2xl animate-fade-in
                      bg-white border-slate-200 dark:bg-[var(--dm-surface-popover)] dark:border-[var(--dm-border)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.7)]">

        <div className="absolute top-0 left-8 right-8 h-px hidden dark:block
                        bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center
                            bg-blue-50 dark:bg-blue-500/10 dark:border dark:border-blue-500/20">
              <RiShieldCheckLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[var(--dm-text-primary)]">
                Which email would you like to monitor?
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 dark:text-[var(--dm-text-muted)]">
                Set up your monitored inbox
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3 py-2 rounded-lg text-xs
                              bg-red-50 border border-red-200 text-red-600
                              dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-slate-400 mb-1.5 dark:text-[var(--dm-text-muted)]">
                Email to monitor
              </label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[var(--dm-text-muted)]" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="inbox@company.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border outline-none transition-all
                             border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                             dark:bg-[var(--dm-chrome)] dark:border-[var(--dm-border)] dark:text-[var(--dm-text-primary)] dark:placeholder:text-[var(--dm-placeholder)]
                             dark:focus:border-blue-500/50 dark:focus:ring-blue-500/10"
                />
              </div>
            </div>
            <button type="submit"
              className="w-full py-2.5 text-sm font-semibold rounded-lg transition-all
                         bg-blue-600 text-white hover:bg-blue-700 shadow-sm
                         dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500 dark:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              Continue to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetMonitoredEmailModal;
