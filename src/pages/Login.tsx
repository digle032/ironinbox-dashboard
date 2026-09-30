import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { RiGoogleFill } from 'react-icons/ri';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { beginGmailSignIn, user } = useAuth();
  const [error, setError] = useState(() => new URLSearchParams(window.location.search).get('gmail') === 'error' ? 'Gmail connection failed or expired. Please try again.' : '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      beginGmailSignIn();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6
                    bg-slate-100 dark:bg-[var(--dm-bg-page)]">

      {/* Dark mode: grid background */}
      <div className="fixed inset-0 pointer-events-none hidden dark:block"
           style={{
             backgroundImage: 'linear-gradient(rgba(100,116,139,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.07) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
           }} />
      <div className="fixed inset-0 pointer-events-none hidden dark:block
                      bg-gradient-to-b from-blue-500/8 via-transparent to-blue-500/5" />

      {/* Card */}
      <div className="relative w-full max-w-md animate-fade-in">

        {/* Glow (dark mode only) */}
        <div className="absolute -inset-px rounded-2xl hidden dark:block
                        bg-gradient-to-b from-blue-500/18 to-transparent blur-sm" />

        <div className="relative rounded-xl border p-8
                        bg-white border-slate-200 shadow-xl
                        dark:bg-[var(--dm-surface-popover)] dark:border-[var(--dm-border)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.6)]">

          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-px hidden dark:block
                          bg-gradient-to-r from-transparent via-blue-500/35 to-transparent" />

          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 flex items-center justify-center mb-2">
              <img src="/logo.png" alt="IronInbox" className="w-24 h-24 object-contain" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight dark:text-[var(--dm-text-primary)]">
              IronInbox
            </h1>
            <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-slate-400 mt-1
                          dark:text-blue-400/50">
              Security Operations Platform
            </p>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-[var(--dm-text-secondary)]">
              Sign in with Gmail
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 dark:text-[var(--dm-text-muted)]">
              Connect a Gmail inbox to securely monitor and classify its messages.
            </p>
          </div>

          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all disabled:opacity-50
                       bg-white border-slate-200 text-slate-700 hover:bg-slate-50
                       dark:bg-[var(--dm-chrome)] dark:border-[var(--dm-border)] dark:text-[var(--dm-text-secondary)] dark:hover:bg-[var(--dm-inset-hover)] dark:hover:text-[var(--dm-text-primary)] dark:hover:border-blue-500/30"
          >
            <RiGoogleFill className="w-4 h-4 text-red-500" />
            Connect Gmail
          </button>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg text-xs
                            bg-red-50 border border-red-200 text-red-600
                            dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
              {error}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
