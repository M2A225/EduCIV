import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ChevronDown } from 'lucide-react';
import type { UserRole } from '../../types';

const ROLE_LABELS: Record<string, string> = {
  DIRECTOR: 'Directeur',
  TEACHER: 'Enseignant',
  ACCOUNTANT: 'Comptable',
  CASHIER: 'Caissier',
  EDUCATOR: 'Éducateur',
  PARENT: 'Parent',
  BACKOFFICE: 'Super Admin',
};

const ROLE_HOMES: Record<string, string> = {
  DIRECTOR: '/',
  TEACHER: '/teacher',
  ACCOUNTANT: '/accountant',
  CASHIER: '/cashier',
  EDUCATOR: '/educator',
  PARENT: '/parent',
  BACKOFFICE: '/backoffice',
};

export function RoleSwitcher() {
  const { activeRole, availableRoles, switchRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (availableRoles.length <= 1) return null;

  const handleSwitch = async (role: UserRole) => {
    await switchRole(role);
    setOpen(false);
    navigate(ROLE_HOMES[role] || '/');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 border border-primary/10 text-sm font-medium text-text hover:bg-white/80 transition-colors w-full"
      >
        <UserCheck className="w-4 h-4 text-primary shrink-0" />
        <span className="truncate">{activeRole ? ROLE_LABELS[activeRole] || activeRole : 'Rôle'}</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-primary/10 z-20 py-1">
            {availableRoles.map(role => {
              const isActive = role === activeRole;
              return (
                <button
                  key={role}
                  onClick={() => handleSwitch(role)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text hover:bg-primary/5'
                  }`}
                >
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span className="truncate">{ROLE_LABELS[role] || role}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
