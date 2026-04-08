import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RiMailLine, RiLockPasswordLine, RiGoogleFill } from 'react-icons/ri';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Please enter email and password.'); return; }
    if (mode === 'signup' && password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (mode === 'signup' && password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result === 'popup') navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6
                    bg-slate-100 dark:bg-[#040c18]">

      {/* Dark mode: grid background */}
      <div className="fixed inset-0 pointer-events-none hidden dark:block"
           style={{
             backgroundImage: 'linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
           }} />
      <div className="fixed inset-0 pointer-events-none hidden dark:block
                      bg-gradient-to-b from-cyan-500/5 via-transparent to-blue-500/5" />

      {/* Card */}
      <div className="relative w-full max-w-md animate-fade-in">

        {/* Glow (dark mode only) */}
        <div className="absolute -inset-px rounded-2xl hidden dark:block
                        bg-gradient-to-b from-cyan-500/20 to-transparent blur-sm" />

        <div className="relative rounded-xl border p-8
                        bg-white border-slate-200 shadow-xl
                        dark:bg-[#0a1628] dark:border-[#0f2a4a] dark:shadow-[0_24px_48px_rgba(0,0,0,0.6)]">

          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-px hidden dark:block
                          bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden bg-[#0a1628] shadow-lg shadow-blue-900/30">
              <img src="/logo.png" alt="IronInbox" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight dark:text-[#e2e8f0]">
              IronInbox
            </h1>
            <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-slate-400 mt-1
                          dark:text-cyan-500/50">
              Security Operations Platform
            </p>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-[#94a3b8]">
              {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 dark:text-[#2a4a6a]">
              Demo mode — any credentials will grant access
            </p>
          </div>

          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all disabled:opacity-50
                       bg-white border-slate-200 text-slate-700 hover:bg-slate-50
                       dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#94a3b8] dark:hover:bg-[#132843] dark:hover:text-[#e2e8f0] dark:hover:border-cyan-500/30"
          >
            <RiGoogleFill className="w-4 h-4 text-red-500" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-[#0f2a4a]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 dark:bg-[#0a1628] dark:text-[#2a4a6a] dark:font-mono">
                or with email
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg text-xs
                            bg-red-50 border border-red-200 text-red-600
                            dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 dark:text-[#4a6080] dark:uppercase dark:tracking-wider dark:font-mono dark:text-[10px]">
                Email
              </label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#2a4a6a]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border outline-none transition-all
                             border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                             dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#e2e8f0] dark:placeholder:text-[#2a4a6a]
                             dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 dark:text-[#4a6080] dark:uppercase dark:tracking-wider dark:font-mono dark:text-[10px]">
                Password
              </label>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#2a4a6a]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border outline-none transition-all
                             border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
                             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                             dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#e2e8f0] dark:placeholder:text-[#2a4a6a]
                             dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 dark:text-[#4a6080] dark:uppercase dark:tracking-wider dark:font-mono dark:text-[10px]">
                  Confirm password
                </label>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#2a4a6a]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border outline-none transition-all
                               border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
                               focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                               dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#e2e8f0] dark:placeholder:text-[#2a4a6a]
                               dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 mt-1 rounded-lg text-sm font-semibold transition-all disabled:opacity-50
                         bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/30
                         dark:bg-cyan-500 dark:text-[#060f1e] dark:hover:bg-cyan-400 dark:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="mt-5 text-center text-xs text-slate-500 dark:text-[#2a4a6a]">
            {mode === 'signin' ? (
              <>
                No account?{' '}
                <button type="button" onClick={() => setMode('signup')}
                  className="text-blue-600 font-semibold hover:underline dark:text-cyan-400">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('signin')}
                  className="text-blue-600 font-semibold hover:underline dark:text-cyan-400">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
