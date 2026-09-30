import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSettings } from './SettingsContext';

export type IntegrationProvider = 'gmail' | 'outlook' | 'slack';
export interface AccountIntegration { provider: IntegrationProvider; connected: boolean; accountEmail: string | null; connectedAtDisplay: string | null; }
interface GmailUser { uid: string; email: string; displayName: string; photoURL: string; }
interface AuthContextType {
  user: GmailUser | null; monitoredEmail: string | null; loading: boolean; isNewUser: boolean;
  accountIntegrations: AccountIntegration[]; beginGmailSignIn: () => void; signOut: () => Promise<void>;
  setMonitoredEmail: (email: string) => void; completeNewUserSetup: (email: string) => void;
  disconnectIntegration: (provider: IntegrationProvider) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GmailUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { updateProfile } = useSettings();
  useEffect(() => {
    let active = true;
    // Discard the legacy browser-only identity. The server session is authoritative.
    localStorage.removeItem('ironinbox_gmail_user');
    sessionStorage.removeItem('ironinbox_pending_gmail_owner');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);
  const endSession = async (path: string) => {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!response.ok && response.status !== 401) throw new Error('Unable to disconnect. Please try again.');
    setUser(null);
  };
  const signOut = () => endSession('/api/auth/logout');
  const accountIntegrations: AccountIntegration[] = user ? [{ provider: 'gmail', connected: true, accountEmail: user.email, connectedAtDisplay: null }] : [];
  return <AuthContext.Provider value={{
    user, monitoredEmail: user?.email ?? null, loading, isNewUser: false, accountIntegrations,
    beginGmailSignIn: () => window.location.assign('/api/gmail/connect'), signOut,
    setMonitoredEmail: () => {}, completeNewUserSetup: () => {},
    disconnectIntegration: provider => { if (provider === 'gmail') void endSession('/api/gmail/disconnect').catch(error => window.alert(error.message)); },
  }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
