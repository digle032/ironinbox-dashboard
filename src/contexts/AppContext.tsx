import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FlaggedEmail, ReleasedEmail, Keyword, DetectionOptions, DetectionActions } from '../types';
import { mockFlaggedEmails, mockKeywords } from '../data/mockData';

interface AppContextType {
  flaggedEmails: FlaggedEmail[];
  releasedEmails: ReleasedEmail[];
  keywords: Keyword[];
  detectionOptions: DetectionOptions;
  detectionActions: DetectionActions;
  selectedEmail: FlaggedEmail | null;
  setSelectedEmail: (email: FlaggedEmail | null) => void;
  releaseEmail: (emailId: string) => void;
  addKeyword: (keyword: string) => void;
  deleteKeyword: (keywordId: string) => void;
  updateDetectionOptions: (options: Partial<DetectionOptions>) => void;
  updateDetectionActions: (actions: Partial<DetectionActions>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flaggedEmails, setFlaggedEmails] = useState<FlaggedEmail[]>(mockFlaggedEmails);
  const [releasedEmails, setReleasedEmails] = useState<ReleasedEmail[]>([]);
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

  const releaseEmail = (emailId: string) => {
    const emailToRelease = flaggedEmails.find(email => email.id === emailId);
    if (emailToRelease) {
      // Add to released emails
      const releasedEmail: ReleasedEmail = {
        id: Date.now().toString(),
        originalEmail: emailToRelease,
        releasedAt: new Date().toLocaleString(),
        releasedBy: 'John Doe'
      };
      setReleasedEmails(prev => [releasedEmail, ...prev]);
      
      // Remove from flagged emails
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
      createdAt: new Date().toISOString()
    };
    setKeywords(prev => [...prev, newKeyword]);
  };

  const deleteKeyword = (keywordId: string) => {
    setKeywords(prev => prev.filter(kw => kw.id !== keywordId));
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
        flaggedEmails,
        releasedEmails,
        keywords,
        detectionOptions,
        detectionActions,
        selectedEmail,
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
