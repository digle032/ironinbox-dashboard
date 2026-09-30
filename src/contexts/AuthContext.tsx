import { AuthContext } from './useAuth';
import React, { useEffect, useState, type ReactNode } from 'react';
import { useSettings } from './useSettings';

export type IntegrationProvider = 'gmail';
export interface AccountIntegration { provider: IntegrationProvider; connected: boolean; accountEmail: string | null; }
interface GmailUser { uid: string; email: string; displayName: string; photoURL: string; }
export interface AuthContextType {
  user: GmailUser | null; monitoredEmail: string | null; loading: boolean;
  accountIntegrations: AccountIntegration[]; beginGmailSignIn: () => void; signOut: () => Promise<void>;
  disconnectIntegration: (provider: IntegrationProvider) => void;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GmailUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { updateProfile } = useSettings();
  useEffect(() => {
    let active = true;
    // Discard the legacy browser-only identity. The server session is authoritative.
    try {
      localStorage.removeItem('ironinbox_gmail_user');
      sessionStorage.removeItem('ironinbox_pending_gmail_owner');
    } catch { /* Server sessions do not require browser storage. */ }
    void fetch('/api/gmail/status').then(async response => {
      if (!response.ok) return;
      const account = await response.json() as { connected: boolean; uid: string; email: string };
      if (active && account.connected) setUser({ uid: account.uid, email: account.email, displayName: account.email.split('@')[0], photoURL: '' });
    }).catch(() => { /* Sign-in remains available when the API is unavailable. */ })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (user) updateProfile({ name: user.displayName, email: user.email, avatar: user.photoURL, role: 'User' });
  }, [user, updateProfile]);
  const endSession = async (path: string) => {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!response.ok && response.status !== 401) throw new Error('Unable to disconnect. Please try again.');
    setUser(null);
  };
  const signOut = () => endSession('/api/auth/logout');
  const accountIntegrations: AccountIntegration[] = user ? [{ provider: 'gmail', connected: true, accountEmail: user.email }] : [];
  return <AuthContext.Provider value={{
    user, monitoredEmail: user?.email ?? null, loading, accountIntegrations,
    beginGmailSignIn: () => window.location.assign('/api/gmail/connect'), signOut,
    disconnectIntegration: provider => { if (provider === 'gmail') void endSession('/api/gmail/disconnect').catch(error => window.alert(error.message)); },
  }}>{children}</AuthContext.Provider>;
};
