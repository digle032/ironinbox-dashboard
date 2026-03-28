export type UserRole = 'admin' | 'manager' | 'viewer';

export const ROLE_LABELS: Record<UserRole, string> = {
  viewer: 'Viewer',
  manager: 'Manager',
  admin: 'Admin',
};

export interface RolePermissions {
  canViewFlaggedEmails: boolean;
  canViewKeywordMonitoring: boolean;
  canViewInbox: boolean;
  canViewEngagementLog: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewFlaggedEmails: true,
    canViewKeywordMonitoring: true,
    canViewInbox: true,
    canViewEngagementLog: true,
  },
  manager: {
    canViewFlaggedEmails: true,
    canViewKeywordMonitoring: true,
    canViewInbox: true,
    canViewEngagementLog: false,
  },
  viewer: {
    canViewFlaggedEmails: false,
    canViewKeywordMonitoring: false,
    canViewInbox: false,
    canViewEngagementLog: false,
  },
};
