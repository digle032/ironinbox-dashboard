import React, { type ReactNode } from 'react';
import { RiLockLine } from 'react-icons/ri';
import type { RolePermissions } from '../../types/roles';
import { useRole } from '../../utils/useRole';

export interface RoleGateProps {
  permission: keyof RolePermissions;
  fallback?: ReactNode;
  children: ReactNode;
}

export const AccessRestrictedBlock: React.FC = () => (
  <div className="relative rounded-2xl border border-slate-100 bg-slate-50/80 overflow-hidden min-h-[200px] flex items-center justify-center dark:border-[#0f2a4a] dark:bg-[#0a1628]">
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3 dark:bg-[#0f2040]">
        <RiLockLine className="w-5 h-5 text-slate-400 dark:text-[#4a6080]" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-slate-600 dark:text-[#94a3b8]">Access Restricted</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs dark:text-[#4a6080]">
        You do not have permission to view this section.
      </p>
    </div>
  </div>
);

const RoleGate: React.FC<RoleGateProps> = ({ permission, fallback = null, children }) => {
  const { hasPermission } = useRole();
  if (hasPermission(permission)) return <>{children}</>;
  return <>{fallback}</>;
};

export default RoleGate;
