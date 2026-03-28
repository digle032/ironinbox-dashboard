import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

const MONITORED_EMAIL_KEY = 'ironinbox_monitored_email';
const NEEDS_MONITORED_EMAIL_KEY = 'ironinbox_needs_monitored_email';

const MOCK_USER_KEY = 'ironinbox_mock_user';

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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<'popup' | 'redirect'>;
  signOut: () => Promise<void>;
  setMonitoredEmail: (email: string) => void;
  completeNewUserSetup: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [monitoredEmail, setMonitoredEmailState] = useState<string | null>(() => {
    return localStorage.getItem(MONITORED_EMAIL_KEY);
  });
  const { updateProfile } = useSettings();

  const setMonitoredEmail = (email: string) => {
    setMonitoredEmailState(email);
    localStorage.setItem(MONITORED_EMAIL_KEY, email);
  };

  const completeNewUserSetup = (email: string) => {
    setMonitoredEmail(email);
    sessionStorage.removeItem(NEEDS_MONITORED_EMAIL_KEY);
    setIsNewUser(false);
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
    setUser(demoUser);
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(demoUser));
    const stored = localStorage.getItem(MONITORED_EMAIL_KEY);
    setMonitoredEmailState(stored || email);
    setIsNewUser(false);
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
    setMonitoredEmailState(demoUser.email);
    if (demoUser.email) {
      localStorage.setItem(MONITORED_EMAIL_KEY, demoUser.email);
    }
    setIsNewUser(false);
    setLoading(false);
    return 'popup' as const;
  };

  const signOut = async () => {
    setUser(null);
    setMonitoredEmailState(null);
    setIsNewUser(false);
    localStorage.removeItem(MONITORED_EMAIL_KEY);
    sessionStorage.removeItem(NEEDS_MONITORED_EMAIL_KEY);
    localStorage.removeItem(MOCK_USER_KEY);
  };

  const value: AuthContextType = {
    user,
    monitoredEmail,
    loading,
    isNewUser,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    setMonitoredEmail,
    completeNewUserSetup
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

