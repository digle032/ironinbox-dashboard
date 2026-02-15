import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AppearanceSettings {
  timezone: string;
}

interface NotificationSettings {
  pushNotifications: boolean;
  soundEnabled: boolean;
  emailDigest: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  dataEncryption: boolean;
  emailAlerts: boolean;
}

interface AdvancedSettings {
  autoRefresh: boolean;
  refreshInterval: number;
}

interface SettingsContextType {
  profile: UserProfile;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  advanced: AdvancedSettings;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateAppearance: (settings: Partial<AppearanceSettings>) => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updateSecurity: (settings: Partial<SecuritySettings>) => void;
  updateAdvanced: (settings: Partial<AdvancedSettings>) => void;
  resetToDefaults: () => void;
  exportSettings: () => void;
  clearCache: () => void;
}

const defaultSettings = {
  profile: {
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Administrator',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff'
  },
  appearance: {
    darkMode: false,
    language: 'en',
    timezone: 'UTC-5'
  },
  notifications: {
    pushNotifications: true,
    soundEnabled: true,
    emailDigest: 'daily'
  },
  security: {
    twoFactorEnabled: true,
    sessionTimeout: '30',
    dataEncryption: true,
    emailAlerts: true
  },
  advanced: {
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load settings from localStorage or use defaults
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ironinbox_profile');
    return saved ? JSON.parse(saved) : defaultSettings.profile;
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
    const saved = localStorage.getItem('ironinbox_appearance');
    return saved ? JSON.parse(saved) : defaultSettings.appearance;
  });

  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('ironinbox_notifications');
    return saved ? JSON.parse(saved) : defaultSettings.notifications;
  });

  const [security, setSecurity] = useState<SecuritySettings>(() => {
    const saved = localStorage.getItem('ironinbox_security');
    return saved ? JSON.parse(saved) : defaultSettings.security;
  });

  const [advanced, setAdvanced] = useState<AdvancedSettings>(() => {
    const saved = localStorage.getItem('ironinbox_advanced');
    return saved ? JSON.parse(saved) : defaultSettings.advanced;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('ironinbox_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('ironinbox_appearance', JSON.stringify(appearance));
  }, [appearance]);

  useEffect(() => {
    localStorage.setItem('ironinbox_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ironinbox_security', JSON.stringify(security));
  }, [security]);

  useEffect(() => {
    localStorage.setItem('ironinbox_advanced', JSON.stringify(advanced));
  }, [advanced]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updateAppearance = (updates: Partial<AppearanceSettings>) => {
    setAppearance(prev => ({ ...prev, ...updates }));
  };

  const updateNotifications = (updates: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...updates }));
    
    // Show notification if sound is enabled
    if (updates.soundEnabled !== undefined && notifications.pushNotifications) {
      if (updates.soundEnabled) {
        console.log('🔊 Sound notifications enabled');
      } else {
        console.log('🔇 Sound notifications disabled');
      }
    }
  };

  const updateSecurity = (updates: Partial<SecuritySettings>) => {
    setSecurity(prev => ({ ...prev, ...updates }));
    
    // Log security changes
    if (updates.twoFactorEnabled !== undefined) {
      console.log(updates.twoFactorEnabled ? '🔐 2FA Enabled' : '🔓 2FA Disabled');
    }
    if (updates.dataEncryption !== undefined) {
      console.log(updates.dataEncryption ? '🔒 Encryption Enabled' : '🔓 Encryption Disabled');
    }
  };

  const updateAdvanced = (updates: Partial<AdvancedSettings>) => {
    setAdvanced(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setProfile(defaultSettings.profile);
    setAppearance(defaultSettings.appearance);
    setNotifications(defaultSettings.notifications);
    setSecurity(defaultSettings.security);
    setAdvanced(defaultSettings.advanced);
    
    // Clear localStorage
    localStorage.removeItem('ironinbox_profile');
    localStorage.removeItem('ironinbox_appearance');
    localStorage.removeItem('ironinbox_notifications');
    localStorage.removeItem('ironinbox_security');
    localStorage.removeItem('ironinbox_advanced');
    
    alert('✅ Settings reset to defaults');
  };

  const exportSettings = () => {
    const allSettings = {
      profile,
      appearance,
      notifications,
      security,
      advanced,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ironinbox-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearCache = () => {
    // Clear any cached data (in a real app, this would clear API caches, etc.)
    const confirmed = window.confirm('Are you sure you want to clear all cached data?');
    if (confirmed) {
      // Clear specific cache items but keep settings
      sessionStorage.clear();
      alert('✅ Cache cleared successfully');
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        profile,
        appearance,
        notifications,
        security,
        advanced,
        updateProfile,
        updateAppearance,
        updateNotifications,
        updateSecurity,
        updateAdvanced,
        resetToDefaults,
        exportSettings,
        clearCache
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
