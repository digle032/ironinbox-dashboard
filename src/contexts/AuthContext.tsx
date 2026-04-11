import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

const MONITORED_EMAIL_KEY = 'ironinbox_monitored_email';
const NEEDS_MONITORED_EMAIL_KEY = 'ironinbox_needs_monitored_email';

const MOCK_USER_KEY = 'ironinbox_mock_user';

export type IntegrationProvider = 'gmail' | 'outlook' | 'slack';

export interface AccountIntegration {
  provider: IntegrationProvider;
  connected: boolean;
  accountEmail: string | null;
  connectedAtDisplay: string | null;
}

const integrationStorageKey = (uid: string) => `ironinbox_integrations_${uid}`;

const formatConnectedDate = () =>
  new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const buildDefaultIntegrations = (
  userEmail: string | null,
  monitoredEmail: string | null,
  isNewUser: boolean
): AccountIntegration[] => {
  if (isNewUser && !monitoredEmail) {
    return [
      { provider: 'gmail', connected: false, accountEmail: null, connectedAtDisplay: null },
      { provider: 'outlook', connected: false, accountEmail: null, connectedAtDisplay: null },
      { provider: 'slack', connected: false, accountEmail: null, connectedAtDisplay: null }
    ];
  }
  const gmailAddr = monitoredEmail || userEmail;
  const localPart = (gmailAddr || 'user').split('@')[0];
  const outlookAddr = `${localPart}@outlook.com`;
  const when = formatConnectedDate();
  return [
    {
      provider: 'gmail',
      connected: !!gmailAddr,
      accountEmail: gmailAddr,
      connectedAtDisplay: gmailAddr ? when : null
    },
    {
      provider: 'outlook',
      connected: true,
      accountEmail: outlookAddr,
      connectedAtDisplay: when
    },
    { provider: 'slack', connected: false, accountEmail: null, connectedAtDisplay: null }
  ];
};

interface DemoUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const createDemoUser = (email: string, nameOverride?: string | null): DemoUser => {
  const baseName = nameOverride || email.split('@')[0] || 'User';
  const displayName = baseName;
  const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&background=0D8ABC&color=fff`;
  return {
    uid: `demo-${email}`,
    email,
    displayName,
    photoURL
  };
};

interface AuthContextType {
  user: DemoUser | null;
  monitoredEmail: string | null;
  loading: boolean;
  isNewUser: boolean;
  accountIntegrations: AccountIntegration[];
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<'popup' | 'redirect'>;
  signOut: () => Promise<void>;
  setMonitoredEmail: (email: string) => void;
  completeNewUserSetup: (email: string) => void;
  disconnectIntegration: (provider: IntegrationProvider) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [monitoredEmail, setMonitoredEmailState] = useState<string | null>(() => {
    return localStorage.getItem(MONITORED_EMAIL_KEY);
  });
  const [accountIntegrations, setAccountIntegrations] = useState<AccountIntegration[]>([]);
  const { updateProfile } = useSettings();
  const userRef = useRef(user);
  userRef.current = user;

  const setMonitoredEmail = (email: string) => {
    setMonitoredEmailState(email);
    localStorage.setItem(MONITORED_EMAIL_KEY, email);
  };

  const completeNewUserSetup = (email: string) => {
    setMonitoredEmail(email);
    sessionStorage.removeItem(NEEDS_MONITORED_EMAIL_KEY);
    setIsNewUser(false);
    const u = userRef.current;
    if (!u) return;
    const outlookAddr = `${email.split('@')[0]}@outlook.com`;
    const when = formatConnectedDate();
    const next: AccountIntegration[] = [
      { provider: 'gmail', connected: true, accountEmail: email, connectedAtDisplay: when },
      { provider: 'outlook', connected: true, accountEmail: outlookAddr, connectedAtDisplay: when },
      { provider: 'slack', connected: false, accountEmail: null, connectedAtDisplay: null }
    ];
    persistIntegrations(u.uid, next);
  };

  useEffect(() => {
    if (!user) return;
    const displayName = user.displayName || user.email?.split('@')[0] || 'User';
    const email = user.email || '';
    const avatar =
      user.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
    updateProfile({ name: displayName, email, avatar, role: 'User' });
  }, [user]);

  const persistIntegrations = (uid: string, next: AccountIntegration[]) => {
    setAccountIntegrations(next);
    try {
      localStorage.setItem(integrationStorageKey(uid), JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!user) {
      setAccountIntegrations([]);
      return;
    }
    try {
      const raw = localStorage.getItem(integrationStorageKey(user.uid));
      if (raw) {
        const parsed = JSON.parse(raw) as AccountIntegration[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const staleAllDisconnected =
            !parsed.some((i) => i.connected) && !!monitoredEmail && !isNewUser;
          if (staleAllDisconnected) {
            persistIntegrations(
              user.uid,
              buildDefaultIntegrations(user.email, monitoredEmail, false)
            );
            return;
          }
          setAccountIntegrations(parsed);
          return;
        }
      }
    } catch {
      /* fall through */
    }
    persistIntegrations(user.uid, buildDefaultIntegrations(user.email, monitoredEmail, isNewUser));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once per uid; uses isNewUser/monitoredEmail at mount
  }, [user?.uid]);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(MOCK_USER_KEY);
      if (rawUser) {
        const parsed = JSON.parse(rawUser) as DemoUser;
        setUser(parsed);
      }
      const storedEmail = localStorage.getItem(MONITORED_EMAIL_KEY);
      if (storedEmail) {
        setMonitoredEmailState(storedEmail);
        setIsNewUser(false);
      }
    } catch (e) {
      // If anything goes wrong, fall back to a signed-out demo state.
      // eslint-disable-next-line no-console
      console.error('Failed to hydrate auth state:', e);
      setUser(null);
      setMonitoredEmailState(null);
      setIsNewUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    void password;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const demoUser = createDemoUser(email);
    const stored = localStorage.getItem(MONITORED_EMAIL_KEY);
    const monitored = stored || email;
    setUser(demoUser);
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(demoUser));
    setMonitoredEmail(monitored);
    setIsNewUser(false);
    persistIntegrations(demoUser.uid, buildDefaultIntegrations(demoUser.email, monitored, false));
    setLoading(false);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    void password;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const demoUser = createDemoUser(email);
    setUser(demoUser);
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(demoUser));
    sessionStorage.setItem(NEEDS_MONITORED_EMAIL_KEY, '1');
    setMonitoredEmailState(null);
    setIsNewUser(true);
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const demoUser = createDemoUser('demo@ironinbox.app', 'IronInbox Demo');
    setUser(demoUser);
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(demoUser));
    if (demoUser.email) {
      setMonitoredEmail(demoUser.email);
      persistIntegrations(demoUser.uid, buildDefaultIntegrations(demoUser.email, demoUser.email, false));
    }
    setIsNewUser(false);
    setLoading(false);
    return 'popup' as const;
  };

  const clearSession = () => {
    const uid = userRef.current?.uid;
    if (uid) {
      try {
        localStorage.removeItem(integrationStorageKey(uid));
      } catch {
        /* ignore */
      }
    }
    setUser(null);
    setMonitoredEmailState(null);
    setIsNewUser(false);
    setAccountIntegrations([]);
    localStorage.removeItem(MONITORED_EMAIL_KEY);
    sessionStorage.removeItem(NEEDS_MONITORED_EMAIL_KEY);
    localStorage.removeItem(MOCK_USER_KEY);
  };

  const signOut = async () => {
    clearSession();
  };

  const disconnectIntegration = (provider: IntegrationProvider) => {
    const uid = userRef.current?.uid;
    if (!uid) return;
    setAccountIntegrations((prev) => {
      const next = prev.map((int) =>
        int.provider === provider
          ? { ...int, connected: false, accountEmail: null, connectedAtDisplay: null }
          : int
      );
      try {
        localStorage.setItem(integrationStorageKey(uid), JSON.stringify(next));
      } catch {
        /* ignore */
      }
      if (!next.some((i) => i.connected)) {
        queueMicrotask(() => clearSession());
      }
      return next;
    });
  };

  const value: AuthContextType = {
    user,
    monitoredEmail,
    loading,
    isNewUser,
    accountIntegrations,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    setMonitoredEmail,
    completeNewUserSetup,
    disconnectIntegration
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
