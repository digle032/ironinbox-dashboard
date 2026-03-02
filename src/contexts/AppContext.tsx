import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { FlaggedEmail, ReleasedEmail, Keyword, DetectionOptions, DetectionActions } from '../types';
import { mockFlaggedEmails, mockKeywords } from '../data/mockData';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface AppContextType {
  flaggedEmails: FlaggedEmail[];
  releasedEmails: ReleasedEmail[];
  keywords: Keyword[];
  detectionOptions: DetectionOptions;
  detectionActions: DetectionActions;
  selectedEmail: FlaggedEmail | null;
  hydrating: boolean;
  setSelectedEmail: (email: FlaggedEmail | null) => void;
  releaseEmail: (emailId: string) => void;
  addKeyword: (keyword: string) => void;
  deleteKeyword: (keywordId: string) => void;
  updateDetectionOptions: (options: Partial<DetectionOptions>) => void;
  updateDetectionActions: (actions: Partial<DetectionActions>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [flaggedEmails, setFlaggedEmails] = useState<FlaggedEmail[]>([]);
  const [releasedEmails, setReleasedEmails] = useState<ReleasedEmail[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<FlaggedEmail | null>(null);
  const [hydrating, setHydrating] = useState(false);
  const [detectionOptions, setDetectionOptions] = useState<DetectionOptions>({
    caseInsensitive: true,
    matchInSubject: true,
    matchInBody: true,
    wholeWordOnly: false
  });
  const [detectionActions, setDetectionActions] = useState<DetectionActions>({
    flagEmail: true,
    logMatch: true,
    showInDashboard: true
  });

  const userRefs = useMemo(() => {
    if (!db || !user?.uid) return null;
    const userDoc = doc(db, 'users', user.uid);
    return {
      userDoc,
      flaggedCol: collection(userDoc, 'flaggedEmails'),
      releasedCol: collection(userDoc, 'releasedEmails'),
      keywordsCol: collection(userDoc, 'keywords'),
      configDoc: doc(userDoc, 'app', 'config')
    };
  }, [user?.uid]);

  useEffect(() => {
    let cancelled = false;

    const seedIfEmpty = async () => {
      if (!userRefs) return;
      const flaggedSnap = await getDocs(userRefs.flaggedCol);
      const keywordSnap = await getDocs(userRefs.keywordsCol);

      if (!flaggedSnap.empty || !keywordSnap.empty) return;

      const batch = writeBatch(db!);
      for (const email of mockFlaggedEmails) {
        const { id, ...data } = email;
        batch.set(doc(userRefs.flaggedCol, id), data);
      }
      for (const kw of mockKeywords) {
        const { id, ...data } = kw;
        batch.set(doc(userRefs.keywordsCol, id), data);
      }
      await batch.commit();
    };

    const hydrate = async () => {
      // If Firestore isn't configured, fall back to demo-only state.
      if (!userRefs || !db || !user) {
        setFlaggedEmails(mockFlaggedEmails);
        setKeywords(mockKeywords);
        setReleasedEmails([]);
        setDetectionOptions({
          caseInsensitive: true,
          matchInSubject: true,
          matchInBody: true,
          wholeWordOnly: false
        });
        setDetectionActions({
          flagEmail: true,
          logMatch: true,
          showInDashboard: true
        });
        return;
      }

      setHydrating(true);
      try {
        await seedIfEmpty();

        const [flaggedSnap, releasedSnap, keywordsSnap, configSnap] = await Promise.all([
          getDocs(userRefs.flaggedCol),
          getDocs(userRefs.releasedCol),
          getDocs(userRefs.keywordsCol),
          getDoc(userRefs.configDoc)
        ]);

        if (cancelled) return;

        const flagged: FlaggedEmail[] = flaggedSnap.docs.map((d) => {
          const data = d.data() as Omit<FlaggedEmail, 'id'>;
          return { id: d.id, ...data };
        });

        const released: ReleasedEmail[] = releasedSnap.docs.map((d) => {
          const data = d.data() as Omit<ReleasedEmail, 'id'>;
          return { id: d.id, ...data };
        });

        const kws: Keyword[] = keywordsSnap.docs.map((d) => {
          const data = d.data() as Omit<Keyword, 'id'>;
          return { id: d.id, ...data };
        });

        setFlaggedEmails(flagged);
        setReleasedEmails(released);
        setKeywords(kws);

        if (configSnap.exists()) {
          const config = configSnap.data() as Partial<{
            detectionOptions: DetectionOptions;
            detectionActions: DetectionActions;
          }>;
          if (config.detectionOptions) setDetectionOptions(config.detectionOptions);
          if (config.detectionActions) setDetectionActions(config.detectionActions);
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    };

    hydrate().catch((e) => {
      // If Firestore read fails (e.g. rules), keep the app usable locally.
      console.error('Failed to hydrate app data:', e);
      if (!cancelled) {
        setFlaggedEmails(mockFlaggedEmails);
        setKeywords(mockKeywords);
        setReleasedEmails([]);
        setHydrating(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userRefs, user?.uid]);

  const releaseEmail = (emailId: string) => {
    const emailToRelease = flaggedEmails.find(email => email.id === emailId);
    if (emailToRelease) {
      // Add to released emails
      const releasedEmail: ReleasedEmail = {
        id: Date.now().toString(),
        originalEmail: emailToRelease,
        releasedAt: new Date().toLocaleString(),
        releasedBy: user?.displayName || user?.email || 'Unknown User'
      };

      // Optimistic UI
      setReleasedEmails(prev => [releasedEmail, ...prev]);
      setFlaggedEmails(prev => prev.filter(email => email.id !== emailId));
      if (selectedEmail?.id === emailId) setSelectedEmail(null);

      if (userRefs && db) {
        const batch = writeBatch(db);
        const { id: releasedId, ...releasedData } = releasedEmail;
        batch.delete(doc(userRefs.flaggedCol, emailId));
        batch.set(doc(userRefs.releasedCol, releasedId), releasedData);
        batch.commit().catch((e) => {
          console.error('Failed to persist releaseEmail:', e);
        });
      }
    }
  };

  const addKeyword = (keyword: string) => {
    const newKeyword: Keyword = {
      id: Date.now().toString(),
      value: keyword,
      createdAt: new Date().toISOString()
    };
    setKeywords(prev => [...prev, newKeyword]);

    if (userRefs && db) {
      const { id, ...data } = newKeyword;
      setDoc(doc(userRefs.keywordsCol, id), data).catch((e) => {
        console.error('Failed to persist addKeyword:', e);
      });
    }
  };

  const deleteKeyword = (keywordId: string) => {
    setKeywords(prev => prev.filter(kw => kw.id !== keywordId));

    if (userRefs && db) {
      deleteDoc(doc(userRefs.keywordsCol, keywordId)).catch((e) => {
        console.error('Failed to persist deleteKeyword:', e);
      });
    }
  };

  const updateDetectionOptions = (options: Partial<DetectionOptions>) => {
    setDetectionOptions(prev => {
      const next = { ...prev, ...options };
      if (userRefs && db) {
        setDoc(userRefs.configDoc, { detectionOptions: next }, { merge: true }).catch((e) => {
          console.error('Failed to persist detectionOptions:', e);
        });
      }
      return next;
    });
  };

  const updateDetectionActions = (actions: Partial<DetectionActions>) => {
    setDetectionActions(prev => {
      const next = { ...prev, ...actions };
      if (userRefs && db) {
        setDoc(userRefs.configDoc, { detectionActions: next }, { merge: true }).catch((e) => {
          console.error('Failed to persist detectionActions:', e);
        });
      }
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        flaggedEmails,
        releasedEmails,
        keywords,
        detectionOptions,
        detectionActions,
        selectedEmail,
        hydrating,
        setSelectedEmail,
        releaseEmail,
        addKeyword,
        deleteKeyword,
        updateDetectionOptions,
        updateDetectionActions
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
