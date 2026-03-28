import type { UserRole } from '../types/roles';

export const DEV_ROLE_CHANGED_EVENT = 'ironinbox_dev_role_changed';

export const setDevRole = (role: UserRole) => {
  localStorage.setItem('ironinbox_user_role', role);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DEV_ROLE_CHANGED_EVENT));
  }
};

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as Window & { setDevRole?: typeof setDevRole }).setDevRole = setDevRole;
}
