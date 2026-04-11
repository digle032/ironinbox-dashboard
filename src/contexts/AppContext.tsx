import React, { createContext, useContext, useState, useMemo, useEffect, useRef, ReactNode } from 'react';
import {
  FlaggedEmail,
  ReleasedEmail,
  Keyword,
  DetectionOptions,
  DetectionActions,
  EmailSourceProvider
} from '../types';
import { mockFlaggedEmails, mockReleasedEmails, mockKeywords } from '../data/mockData';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';

const cloneEmailMocks = () => ({
  flagged: mockFlaggedEmails.map((e) => ({ ...e })),
  released: mockReleasedEmails.map((r) => ({
    ...r,
    originalEmail: { ...r.originalEmail }
  }))
});

const EMPTY_FLAGGED_EMAILS: FlaggedEmail[] = [];
const EMPTY_KEYWORDS: Keyword[] = [];
const EMPTY_RELEASED_EMAILS: ReleasedEmail[] = [];

export type AppIncident = {
  id: string;
  createdTime: string;
  reporter: string;
  subject: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  dueDate: string;
  description: string;
  category?: string;
  assignedTo?: string;
  source?: string;
  sourceEmailId?: string;
};

interface AppContextType {
  flaggedEmails: FlaggedEmail[];
  releasedEmails: ReleasedEmail[];
  keywords: Keyword[];
  detectionOptions: DetectionOptions;
  detectionActions: DetectionActions;
  selectedEmail: FlaggedEmail | null;
  linkedIncidents: AppIncident[];
  setSelectedEmail: (email: FlaggedEmail | null) => void;
  createIncidentFromFlaggedEmail: (
    email: FlaggedEmail,
    options: { dueDate: string; assignedTo?: string }
  ) => AppIncident;
  releaseEmail: (emailId: string) => void;
  toggleStarReleasedEmail: (releasedId: string) => void;
  toggleReadReleasedEmail: (releasedId: string, isRead?: boolean) => void;
  reFlagReleasedEmails: (releasedIds: string[]) => void;
  addKeyword: (keyword: string) => void;
  deleteKeyword: (keywordId: string) => void;
  toggleKeyword: (id: string) => void;
  updateKeyword: (id: string, text: string) => void;
  updateDetectionOptions: (options: Partial<DetectionOptions>) => void;
  updateDetectionActions: (actions: Partial<DetectionActions>) => void;
  isWiped: boolean;
  wipeAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { riskFlagThreshold } = useSettings();
  const { user, accountIntegrations } = useAuth();
  const [isWiped, setIsWiped] = useState(false);
  const [flaggedEmails, setFlaggedEmails] = useState<FlaggedEmail[]>(mockFlaggedEmails);
  const [releasedEmails, setReleasedEmails] = useState<ReleasedEmail[]>(mockReleasedEmails);
  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywords);
  const [selectedEmail, setSelectedEmail] = useState<FlaggedEmail | null>(null);
  const [linkedIncidents, setLinkedIncidents] = useState<AppIncident[]>([]);
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

  const connectedProviders = useMemo(() => {
    const set = new Set<EmailSourceProvider>();
    accountIntegrations.forEach((i) => {
      if (i.connected) set.add(i.provider as EmailSourceProvider);
    });
    return set;
  }, [accountIntegrations]);

  const integrationSnapshot = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      setFlaggedEmails(EMPTY_FLAGGED_EMAILS);
      setReleasedEmails(EMPTY_RELEASED_EMAILS);
      setSelectedEmail(null);
      setLinkedIncidents([]);
      setIsWiped(false);
      integrationSnapshot.current = null;
      return;
    }
    const { flagged, released } = cloneEmailMocks();
    setFlaggedEmails(flagged);
    setReleasedEmails(released);
    setKeywords(mockKeywords);
    setSelectedEmail(null);
    setLinkedIncidents([]);
    setIsWiped(false);
    integrationSnapshot.current = null;
  }, [user?.uid]);

  useEffect(() => {
    if (!user || accountIntegrations.length === 0) return;
    const connected = new Set(
      accountIntegrations.filter((i) => i.connected).map((i) => i.provider as EmailSourceProvider)
    );
    const key = [...connected].sort().join(',');
    if (integrationSnapshot.current === null) {
      integrationSnapshot.current = key;
      return;
    }
    if (integrationSnapshot.current === key) return;
    const prevProviders = integrationSnapshot.current
      .split(',')
      .filter(Boolean) as EmailSourceProvider[];
    const disconnected = prevProviders.filter((p) => !connected.has(p));
    integrationSnapshot.current = key;
    if (disconnected.length === 0) return;

    setFlaggedEmails((prevEmails) => {
      const removedIds = prevEmails
        .filter((e) => disconnected.includes(e.sourceProvider))
        .map((e) => e.id);
      if (removedIds.length > 0) {
        queueMicrotask(() => {
          setLinkedIncidents((li) => li.filter((inc) => !removedIds.includes(inc.sourceEmailId || '')));
        });
      }
      return prevEmails.filter((e) => !disconnected.includes(e.sourceProvider));
    });
    setReleasedEmails((prevR) =>
      prevR.filter((r) => !disconnected.includes(r.originalEmail.sourceProvider))
    );
    setSelectedEmail((sel) =>
      sel && disconnected.includes(sel.sourceProvider) ? null : sel
    );
  }, [user, accountIntegrations]);

  const displayedFlaggedEmails = useMemo(() => {
    const base = isWiped ? EMPTY_FLAGGED_EMAILS : flaggedEmails;
    const byScore = base.filter((e) => e.riskScore >= riskFlagThreshold);
    if (!user) return byScore;
    if (accountIntegrations.length === 0) return [];
    if (connectedProviders.size === 0) return [];
    return byScore.filter((e) => connectedProviders.has(e.sourceProvider));
  }, [isWiped, flaggedEmails, riskFlagThreshold, user, accountIntegrations.length, connectedProviders]);

  const displayedKeywords = isWiped ? EMPTY_KEYWORDS : keywords;
  const displayedReleasedEmails = useMemo(() => {
    const base = isWiped ? EMPTY_RELEASED_EMAILS : releasedEmails;
    if (!user) return base;
    if (accountIntegrations.length === 0) return [];
    if (connectedProviders.size === 0) return [];
    return base.filter((r) => connectedProviders.has(r.originalEmail.sourceProvider));
  }, [isWiped, releasedEmails, user, accountIntegrations.length, connectedProviders]);

  const displayedSelectedEmail = isWiped ? null : selectedEmail;

  const wipeAllData = () => {
    setIsWiped(true);
    setLinkedIncidents([]);
    setSelectedEmail(null);
  };

  const releaseEmail = (emailId: string) => {
    const emailToRelease = flaggedEmails.find(email => email.id === emailId);
    if (emailToRelease) {
      const releasedEmail: ReleasedEmail = {
        id: Date.now().toString(),
        originalEmail: emailToRelease,
        releasedAt: new Date().toLocaleString(),
        releasedBy: 'John Doe',
        starred: false,
        isRead: false
      };

      setReleasedEmails(prev => [releasedEmail, ...prev]);
      setFlaggedEmails(prev => prev.filter(email => email.id !== emailId));

      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    }
  };

  const addKeyword = (keyword: string) => {
    const newKeyword: Keyword = {
      id: Date.now().toString(),
      value: keyword,
      createdAt: new Date().toISOString(),
      enabled: true
    };
    setKeywords(prev => [...prev, newKeyword]);
  };

  const deleteKeyword = (keywordId: string) => {
    setKeywords(prev => prev.filter(kw => kw.id !== keywordId));
  };

  const toggleKeyword = (keywordId: string) => {
    setKeywords(prev =>
      prev.map(kw =>
        kw.id === keywordId ? { ...kw, enabled: !kw.enabled } : kw
      )
    );
  };

  const updateKeyword = (keywordId: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setKeywords(prev =>
      prev.map(kw =>
        kw.id === keywordId ? { ...kw, value: trimmed } : kw
      )
    );
  };

  const toggleStarReleasedEmail = (releasedId: string) => {
    setReleasedEmails(prev =>
      prev.map(released =>
        released.id === releasedId ? { ...released, starred: !released.starred } : released
      )
    );
  };

  const toggleReadReleasedEmail = (releasedId: string, isRead?: boolean) => {
    setReleasedEmails(prev =>
      prev.map(released => {
        if (released.id !== releasedId) return released;
        const nextRead = typeof isRead === 'boolean' ? isRead : !released.isRead;
        return { ...released, isRead: nextRead };
      })
    );
  };

  const reFlagReleasedEmails = (releasedIds: string[]) => {
    if (releasedIds.length === 0) return;

    const toReflag = releasedEmails.filter(r => releasedIds.includes(r.id));
    if (toReflag.length === 0) return;

    setFlaggedEmails(prev => [...toReflag.map(r => r.originalEmail), ...prev]);
    setReleasedEmails(prev => prev.filter(r => !releasedIds.includes(r.id)));
  };

  const updateDetectionOptions = (options: Partial<DetectionOptions>) => {
    setDetectionOptions(prev => ({ ...prev, ...options }));
  };

  const updateDetectionActions = (actions: Partial<DetectionActions>) => {
    setDetectionActions(prev => ({ ...prev, ...actions }));
  };

  const createIncidentFromFlaggedEmail = (
    email: FlaggedEmail,
    options: { dueDate: string; assignedTo?: string }
  ) => {
    const now = new Date();
    const suffix = String(now.getTime()).slice(-4);
    const incident: AppIncident = {
      id: `INC-LINK-${suffix}`,
      createdTime: 'Just now',
      reporter: 'Flagged Email Workflow',
      subject: `Email Threat Investigation: ${email.subject}`,
      priority: email.riskLevel,
      status: 'Open',
      dueDate: options.dueDate,
      description: `A flagged email was automatically escalated for investigation after detection controls identified multiple suspicious indicators in the message context and content. The email was received from ${email.sender} on ${email.received} and classified as ${email.riskLevel.toLowerCase()} risk based on the triggered rules.\n\nInitial analysis found the following indicators: ${email.signals.map(signal => `${signal.type} match "${signal.value}"`).join(', ')}. Analysts should validate sender legitimacy, review embedded links or attachments, and confirm whether recipient interaction occurred before containment and remediation actions are finalized.`,
      category: 'Email Security',
      assignedTo: options.assignedTo || 'SOC Team',
      source: 'Flagged Email',
      sourceEmailId: email.id
    };

    setLinkedIncidents(prev => [incident, ...prev]);
    return incident;
  };

  return (
    <AppContext.Provider
      value={{
        flaggedEmails: displayedFlaggedEmails,
        releasedEmails: displayedReleasedEmails,
        keywords: displayedKeywords,
        detectionOptions,
        detectionActions,
        selectedEmail: displayedSelectedEmail,
        linkedIncidents,
        setSelectedEmail,
        createIncidentFromFlaggedEmail,
        releaseEmail,
        toggleStarReleasedEmail,
        toggleReadReleasedEmail,
        reFlagReleasedEmails,
        addKeyword,
        deleteKeyword,
        toggleKeyword,
        updateKeyword,
        updateDetectionOptions,
        updateDetectionActions,
        isWiped,
        wipeAllData
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
