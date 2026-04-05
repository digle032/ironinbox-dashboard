import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FlaggedEmail, ReleasedEmail, Keyword, DetectionOptions, DetectionActions } from '../types';
import { mockFlaggedEmails, mockReleasedEmails, mockKeywords } from '../data/mockData';

const EMPTY_FLAGGED_EMAILS: FlaggedEmail[] = [];
const EMPTY_KEYWORDS: Keyword[] = [];
const EMPTY_RELEASED_EMAILS: ReleasedEmail[] = [];

interface AppContextType {
  flaggedEmails: FlaggedEmail[];
  releasedEmails: ReleasedEmail[];
  keywords: Keyword[];
  detectionOptions: DetectionOptions;
  detectionActions: DetectionActions;
  selectedEmail: FlaggedEmail | null;
  setSelectedEmail: (email: FlaggedEmail | null) => void;
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
  const [isWiped, setIsWiped] = useState(false);
  const [flaggedEmails, setFlaggedEmails] = useState<FlaggedEmail[]>(mockFlaggedEmails);
  const [releasedEmails, setReleasedEmails] = useState<ReleasedEmail[]>(mockReleasedEmails);
  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywords);
  const [selectedEmail, setSelectedEmail] = useState<FlaggedEmail | null>(null);
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

  const displayedFlaggedEmails = isWiped ? EMPTY_FLAGGED_EMAILS : flaggedEmails;
  const displayedKeywords = isWiped ? EMPTY_KEYWORDS : keywords;
  const displayedReleasedEmails = isWiped ? EMPTY_RELEASED_EMAILS : releasedEmails;
  const displayedSelectedEmail = isWiped ? null : selectedEmail;

  const wipeAllData = () => {
    setIsWiped(true);
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

  return (
    <AppContext.Provider
      value={{
        flaggedEmails: displayedFlaggedEmails,
        releasedEmails: displayedReleasedEmails,
        keywords: displayedKeywords,
        detectionOptions,
        detectionActions,
        selectedEmail: displayedSelectedEmail,
        setSelectedEmail,
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
