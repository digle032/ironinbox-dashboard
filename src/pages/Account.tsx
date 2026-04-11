import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { RiAddLine, RiCheckLine, RiDeleteBinLine, RiUserLine } from 'react-icons/ri';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth, type AccountIntegration, type IntegrationProvider } from '../contexts/AuthContext';

const providerTitle = (p: IntegrationProvider) =>
  p === 'gmail' ? 'Gmail' : p === 'outlook' ? 'Outlook' : 'Slack';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useSettings();
  const { user, accountIntegrations, disconnectIntegration } = useAuth();

  const panel =
    'bg-white border border-slate-200 rounded-xl p-6 shadow-sm dark:bg-[var(--dm-surface-card)] dark:border-[var(--dm-border)]';

  const sortIntegrations = (list: AccountIntegration[]) => {
    const order: IntegrationProvider[] = ['gmail', 'outlook', 'slack'];
    return [...list].sort((a, b) => order.indexOf(a.provider) - order.indexOf(b.provider));
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[var(--dm-bg-page)]">
      <Header title="Account" />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Account info — reflects signed-in user + profile (updated from auth) */}
        <div className={panel}>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-[var(--dm-text-primary)] mb-4">
            Account Info
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <img
              src={profile.avatar}
              alt=""
              className="w-20 h-20 rounded-full border border-slate-200 dark:border-[var(--dm-border)] object-cover"
            />
            <div className="min-w-0">
              <p className="text-lg font-semibold text-slate-900 dark:text-[var(--dm-text-primary)]">
                {profile.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-[var(--dm-text-muted)] mt-0.5">{profile.email}</p>
              {profile.phone && (
                <p className="text-xs text-slate-600 dark:text-[var(--dm-text-secondary)] mt-3">{profile.phone}</p>
              )}
              {user?.email && user.email !== profile.email && (
                <p className="text-[10px] font-mono text-slate-400 mt-2 dark:text-[var(--dm-text-muted)]">
                  Session: {user.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Connected integrations — Active/Inactive from mock connection state */}
        <div className={panel}>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-[var(--dm-text-primary)] mb-1">
            Connected Accounts
          </h2>
          <p className="text-xs text-slate-400 mb-4 dark:text-[var(--dm-text-muted)]">
            Status reflects what is connected in this demo session (stored per user in the browser).
          </p>
          <ul className="space-y-4">
            {sortIntegrations(accountIntegrations).map((int) => (
              <li
                key={int.provider}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0 dark:border-[var(--dm-border)]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                    <RiCheckLine className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-[var(--dm-text-primary)]">
                      {providerTitle(int.provider)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-[var(--dm-text-muted)] mt-0.5">
                      Email:{' '}
                      {int.connected && int.accountEmail ? int.accountEmail : 'Not connected'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-[var(--dm-text-muted)]">
                      Connected:{' '}
                      {int.connected && int.connectedAtDisplay ? int.connectedAtDisplay : 'Not connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${
                      int.connected
                        ? 'border-emerald-500/40 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50'
                        : 'border-rose-500/35 text-rose-700 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50'
                    }`}
                  >
                    {int.connected ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    onClick={() => disconnectIntegration(int.provider)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  >
                    <RiDeleteBinLine className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              </li>
            ))}
            {accountIntegrations.length === 0 && (
              <li className="text-xs text-slate-400 dark:text-[var(--dm-text-muted)]">
                Sign in to load connection state.
              </li>
            )}
          </ul>
        </div>

        <div className={panel}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center dark:bg-blue-500/10">
              <RiUserLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[var(--dm-text-primary)]">
                Add Another Account
              </h2>
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

        <div className={panel}>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-[var(--dm-text-primary)] mb-2">
            Disconnect an Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-[var(--dm-text-muted)] leading-relaxed">
            Use the Disconnect button inside &quot;Connected Accounts&quot; to remove a specific integration. That
            removes inbox and flagged data for that source. Disconnecting every account signs you out.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Account;
