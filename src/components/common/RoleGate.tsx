import React, { type ReactNode } from 'react';
import { RiLockLine } from 'react-icons/ri';
import type { RolePermissions } from '../../types/roles';
import { useRole } from '../../utils/useRole';

export interface RoleGateProps {
  permission: keyof RolePermissions;
  fallback?: ReactNode;
  children: ReactNode;
}

const RoleGate: React.FC<RoleGateProps> = ({
  permission,
  fallback,
  children,
}) => {
  const { hasPermission } = useRole();
  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  if (fallback != null) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative rounded-2xl border border-slate-100 bg-slate-50/80 overflow-hidden min-h-[140px] flex items-center justify-center shadow-xl shadow-slate-200/30 ring-1 ring-slate-900/[0.04] dark:border-[#334155] dark:bg-[#1e293b] dark:shadow-lg dark:shadow-black/25 dark:ring-white/[0.06]">
      <div
        className="absolute inset-0 backdrop-blur-sm bg-white/40 pointer-events-none dark:bg-[#0f172a]/40 dark:backdrop-blur-none"
        aria-hidden
      />
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shadow-lg ring-2 ring-slate-600/40 mb-3 dark:bg-slate-700 dark:ring-slate-500/30">
          <RiLockLine className="w-6 h-6 text-slate-100" aria-hidden />
        </div>
        <p className="text-sm font-bold text-slate-800 tracking-wide dark:text-[#f8fafc]">
          Access Restricted
        </p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs dark:text-[#94a3b8]">
          You do not have permission to view this section.
        </p>
      </div>
    </div>
  );
};

export default RoleGate;
