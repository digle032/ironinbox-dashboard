export type FlaggedEmail = {
  id: string;
  received: string;
  sender: string;
  subject: string;
  signals: Signal[];
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  content: string;
}

export type ReleasedEmail = {
  id: string;
  originalEmail: FlaggedEmail;
  releasedAt: string;
  releasedBy: string;
  starred: boolean;
  isRead: boolean;
}

export type Signal = {
  type: 'keyword' | 'typo';
  value: string;
  description: string;
}

export type Keyword = {
  id: string;
  value: string;
  createdAt: string;
  enabled: boolean;
}

export type DetectionOptions = {
  caseInsensitive: boolean;
  matchInSubject: boolean;
  matchInBody: boolean;
  wholeWordOnly: boolean;
}

export type DetectionActions = {
  flagEmail: boolean;
  logMatch: boolean;
  showInDashboard: boolean;
}
