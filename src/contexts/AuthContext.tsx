import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSettings } from './SettingsContext';

const USER_KEY = 'ironinbox_gmail_user';
const PENDING_OWNER_KEY = 'ironinbox_pending_gmail_owner';

export type IntegrationProvider = 'gmail' | 'outlook' | 'slack';
export interface AccountIntegration {
  provider: IntegrationProvider;
  connected: boolean;
  accountEmail: string | null;
  connectedAtDisplay: string | null;
}

interface GmailUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface AuthContextType {
  user: GmailUser | null;
  monitoredEmail: string | null;
  loading: boolean;
  isNewUser: boolean;
  accountIntegrations: AccountIntegration[];
  beginGmailSignIn: () => void;
  signOut: () => Promise<void>;
  setMonitoredEmail: (email: string) => void;
  completeNewUserSetup: (email: string) => void;
  disconnectIntegration: (provider: IntegrationProvider) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const integrationFor = (email: string): AccountIntegration[] => [{
  provider: 'gmail', connected: true, accountEmail: email,
  connectedAtDisplay: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
}];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GmailUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountIntegrations, setAccountIntegrations] = useState<AccountIntegration[]>([]);
  const { updateProfile } = useSettings();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ownerId = params.get('ownerId');
    const email = params.get('email');
    const pendingOwner = sessionStorage.getItem(PENDING_OWNER_KEY);
    if (params.get('gmail') === 'connected' && ownerId && email && ownerId === pendingOwner) {
      const next: GmailUser = {
        uid: ownerId, email, displayName: email.split('@')[0],
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=0D8ABC&color=fff`,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      sessionStorage.removeItem(PENDING_OWNER_KEY);
      setUser(next);
      setAccountIntegrations(integrationFor(email));
      window.history.replaceState({}, document.title, window.location.pathname || '/dashboard');
    } else {
      try {
        const saved = localStorage.getItem(USER_KEY);
        if (saved) {
          const savedUser = JSON.parse(saved) as GmailUser;
          setUser(savedUser);
          setAccountIntegrations(integrationFor(savedUser.email));
        }
      } catch { localStorage.removeItem(USER_KEY); }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    updateProfile({ name: user.displayName, email: user.email, avatar: user.photoURL, role: 'User' });
    // The settings provider recreates updateProfile after each update; the connected mailbox is stable by uid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const beginGmailSignIn = () => {
    const ownerId = crypto.randomUUID();
    sessionStorage.setItem(PENDING_OWNER_KEY, ownerId);
    window.location.assign(`/api/gmail/connect?ownerId=${encodeURIComponent(ownerId)}`);
  };

  const signOut = async () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setAccountIntegrations([]);
  };

  const setMonitoredEmail = () => { /* Gmail OAuth selects and verifies the monitored inbox. */ };
  const completeNewUserSetup = () => { /* Retained for layout compatibility; Gmail setup is the real flow. */ };
  const disconnectIntegration = (provider: IntegrationProvider) => {
    if (provider === 'gmail' && user) {
      void fetch('/api/gmail/disconnect', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ownerId: user.uid }),
      }).finally(() => void signOut());
    }
  };

  return <AuthContext.Provider value={{
    user, monitoredEmail: user?.email ?? null, loading, isNewUser: false, accountIntegrations,
    beginGmailSignIn, signOut, setMonitoredEmail, completeNewUserSetup, disconnectIntegration,
  }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
