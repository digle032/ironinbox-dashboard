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
    <div className="relative rounded-2xl border border-slate-200/80 bg-slate-100/50 overflow-hidden min-h-[140px] flex items-center justify-center">
      <div
        className="absolute inset-0 backdrop-blur-sm bg-slate-200/30 pointer-events-none"
        aria-hidden
      />
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800/90 flex items-center justify-center shadow-lg ring-2 ring-slate-600/50 mb-3">
          <RiLockLine className="w-6 h-6 text-slate-200" aria-hidden />
        </div>
        <p className="text-sm font-bold text-slate-700 tracking-wide">
          Access Restricted
        </p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          You do not have permission to view this section.
        </p>
      </div>
    </div>
  );
};

export default RoleGate;
