import React, { useCallback, useEffect, useState, type ReactNode } from 'react';
import { SettingsContext } from './useSettings';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
}
export interface AlertBehaviorSettings {
  showDashboardAlerts: boolean;
  highlightFlaggedInbox: boolean;
}
export interface SettingsContextType {
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
  advanced: { autoRefresh: boolean; refreshInterval: number };
  alertBehavior: AlertBehaviorSettings;
  updateAlertBehavior: (settings: Partial<AlertBehaviorSettings>) => void;
  riskFlagThreshold: number;
  setRiskFlagThreshold: (value: number) => void;
}
const advanced = { autoRefresh: true, refreshInterval: 30000 };
const defaults: AlertBehaviorSettings = { showDashboardAlerts: true, highlightFlaggedInbox: true };
const clampThreshold = (value: number) => Number.isFinite(value) ? Math.min(75, Math.max(25, Math.round(value))) : 50;

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '', role: 'User', avatar: '/logo.png' });
  const [alertBehavior, setAlertBehavior] = useState<AlertBehaviorSettings>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ironinbox_alert_behavior') || '{}');
      return {
        showDashboardAlerts: typeof saved?.showDashboardAlerts === 'boolean' ? saved.showDashboardAlerts : true,
        highlightFlaggedInbox: typeof saved?.highlightFlaggedInbox === 'boolean' ? saved.highlightFlaggedInbox : true,
      };
    } catch { return defaults; }
  });
  const [riskFlagThreshold, setThreshold] = useState(() => {
    try {
      const saved = localStorage.getItem('ironinbox_risk_threshold');
      return saved === null ? 50 : clampThreshold(Number(saved));
    } catch { return 50; }
  });
  useEffect(() => {
    try {
      localStorage.setItem('ironinbox_alert_behavior', JSON.stringify(alertBehavior));
      localStorage.setItem('ironinbox_risk_threshold', String(riskFlagThreshold));
    } catch { /* Preferences still work when browser storage is unavailable. */ }
  }, [alertBehavior, riskFlagThreshold]);
  const updateProfile = useCallback((value: Partial<UserProfile>) => setProfile(previous => ({ ...previous, ...value })), []);
  return <SettingsContext.Provider value={{
    profile, updateProfile, advanced, alertBehavior, riskFlagThreshold,
    updateAlertBehavior: value => setAlertBehavior(previous => ({ ...previous, ...value })),
    setRiskFlagThreshold: value => setThreshold(clampThreshold(value)),
  }}>{children}</SettingsContext.Provider>;
};
