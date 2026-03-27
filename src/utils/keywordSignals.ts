import { FlaggedEmail, Keyword, Signal } from '../types';

const norm = (s: string) => s.trim().toLowerCase();

// Keyword signal is shown only when an enabled keyword matches its value.
export function getVisibleSignals(email: FlaggedEmail, keywords: Keyword[]): Signal[] {
  return email.signals.filter(signal => {
    if (signal.type === 'typo') return true;
    return keywords.some(kw => kw.enabled && norm(kw.value) === norm(signal.value));
  });
}

// Emails with at least one visible signal will still be enabled.
export function filterVisibleFlaggedEmails(emails: FlaggedEmail[], keywords: Keyword[]): FlaggedEmail[] {
  return emails.filter(e => getVisibleSignals(e, keywords).length > 0);
}

export function hasVisibleKeywordHit(email: FlaggedEmail, keywords: Keyword[]): boolean {
  return getVisibleSignals(email, keywords).some(s => s.type === 'keyword');
}

export function hasVisibleTypoHit(email: FlaggedEmail, keywords: Keyword[]): boolean {
  return getVisibleSignals(email, keywords).some(s => s.type === 'typo');
}
