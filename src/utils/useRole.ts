import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ROLE_PERMISSIONS,
  type RolePermissions,
  type UserRole,
} from '../types/roles';
import { DEV_ROLE_CHANGED_EVENT } from './devRoleHelper';

const ROLE_STORAGE_KEY = 'ironinbox_user_role';

function readRoleFromStorage(): UserRole {
  try {
    const raw = localStorage.getItem(ROLE_STORAGE_KEY);
    const normalized = raw?.trim().toLowerCase();
    if (
      normalized === 'admin' ||
      normalized === 'manager' ||
      normalized === 'viewer'
    ) {
      return normalized;
    }
  } catch {
    /* localStorage unavailable */
  }
  return 'viewer';
}

export function useRole() {
  const [role, setRole] = useState<UserRole>(() => readRoleFromStorage());

  useEffect(() => {
    const sync = () => setRole(readRoleFromStorage());
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEV_ROLE_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEV_ROLE_CHANGED_EVENT, sync);
    };
  }, []);

  const permissions = useMemo(() => ROLE_PERMISSIONS[role], [role]);

  const hasPermission = useCallback(
    (key: keyof RolePermissions) => Boolean(permissions[key]),
    [permissions]
  );

  return { role, permissions, hasPermission };
}
