import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const ENGAGEMENT_LOG_KEY = 'ironinbox_engagement_log';
export const ENGAGEMENT_LOG_UPDATED_EVENT = 'ironinbox_engagement_updated';

export interface EngagementLogEntry {
  uid: string;
  page: string;
  email: string;
  timestamp: string;
}

function todayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function readLog(): EngagementLogEntry[] {
  try {
    const raw = localStorage.getItem(ENGAGEMENT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as EngagementLogEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLog(entries: EngagementLogEntry[]) {
  try {
    localStorage.setItem(ENGAGEMENT_LOG_KEY, JSON.stringify(entries));
  } catch {
    /* quota / private mode */
  }
}

export function useEngagementTracker(pageName: string) {
  const { user } = useAuth();
  const pageRef = useRef(pageName);
  pageRef.current = pageName;

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;

    const page = pageRef.current;
    const now = new Date();
    const dateStr = todayKey(now);
    const compositeKey = `${uid}_${page}_${dateStr}`;

    const log = readLog();
    const exists = log.some((e) => {
      const entryDay = todayKey(new Date(e.timestamp));
      return `${e.uid}_${e.page}_${entryDay}` === compositeKey;
    });

    if (exists) return;

    const email = user.email ?? '';
    const entry: EngagementLogEntry = {
      uid,
      page,
      email,
      timestamp: now.toISOString(),
    };

    log.push(entry);
    writeLog(log);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(ENGAGEMENT_LOG_UPDATED_EVENT));
    }
  }, [user?.uid, user?.email, pageName]);
}
