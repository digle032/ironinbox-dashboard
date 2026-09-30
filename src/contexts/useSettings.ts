import { createContext, useContext } from 'react';
import type { SettingsContextType } from './SettingsContext';
export type * from './SettingsContext';

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
