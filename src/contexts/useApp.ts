import { createContext, useContext } from 'react';
import type { AppContextType } from './AppContext';
export type * from './AppContext';

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
