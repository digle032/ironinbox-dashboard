import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useSettings } from './SettingsContext';

const MONITORED_EMAIL_KEY = 'ironinbox_monitored_email';
const NEEDS_MONITORED_EMAIL_KEY = 'ironinbox_needs_monitored_email';

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [monitoredEmail, setMonitoredEmailState] = useState<string | null>(() => {
    return localStorage.getItem(MONITORED_EMAIL_KEY);
  });
  const { updateProfile } = useSettings();

  // Persist monitored email to localStorage
  const setMonitoredEmail = (email: string) => {
    setMonitoredEmailState(email);
    localStorage.setItem(MONITORED_EMAIL_KEY, email);
  };

  const completeNewUserSetup = (email: string) => {
    setMonitoredEmail(email);
    sessionStorage.removeItem(NEEDS_MONITORED_EMAIL_KEY);
    setIsNewUser(false);
  };

  // Sync profile from auth user
  useEffect(() => {
    if (!user) return;
    const displayName = user.displayName || user.email?.split('@')[0] || 'User';
    const email = user.email || '';
    const avatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
    updateProfile({ name: displayName, email, avatar, role: 'User' });
  }, [user, updateProfile]);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const stored = localStorage.getItem(MONITORED_EMAIL_KEY);
        const needsSetup = sessionStorage.getItem(NEEDS_MONITORED_EMAIL_KEY);
        if (stored) {
          setMonitoredEmailState(stored);
          setIsNewUser(false);
        } else if (needsSetup) {
          setMonitoredEmailState(null);
          setIsNewUser(true);
        } else {
          setMonitoredEmailState(u.email || null);
          setIsNewUser(false);
        }
      } else {
        setMonitoredEmailState(null);
        setIsNewUser(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    const stored = localStorage.getItem(MONITORED_EMAIL_KEY);
    setMonitoredEmailState(stored || email);
    setIsNewUser(false);
    setLoading(false);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    sessionStorage.setItem(NEEDS_MONITORED_EMAIL_KEY, '1');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    setMonitoredEmailState(null);
    setIsNewUser(true);
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase not configured');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      setUser(u);
      setLoading(false);
      if (u.email) {
        setMonitoredEmailState(u.email);
        localStorage.setItem(MONITORED_EMAIL_KEY, u.email);
      }
      setIsNewUser(false);
      return 'popup' as const;
    } catch (err: unknown) {
      const code = typeof err === 'object' && err && 'code' in err ? (err as { code?: string }).code : undefined;
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
        return 'redirect' as const;
      }
      throw err;
    }
  };

  const signOut = async () => {
    if (auth) await firebaseSignOut(auth);
    localStorage.removeItem(MONITORED_EMAIL_KEY);
    setUser(null);
    setMonitoredEmailState(null);
    setIsNewUser(false);
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
