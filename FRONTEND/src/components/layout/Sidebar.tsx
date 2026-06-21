import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { NAV_CONFIG } from '../../config/navigation';
import { SchoolSwitcher } from '../ui/SchoolSwitcher';
import { RoleSwitcher } from '../ui/RoleSwitcher';
import { Logo } from '../ui/Logo';
import {
  LogOut, LayoutDashboard, Users, School, UserCheck,
  BookOpen, CalendarDays, Calendar, UserX, FileText, Award, CreditCard,
  ClipboardCheck, AlertTriangle, Heart, UserCog, Settings, Building, Circle,
  Upload, Archive, BarChart3, CalendarPlus, GraduationCap, Menu, X,
  type LucideIcon,
} from 'lucide-react';
import { studentService } from '../../services/students';
import { notesService } from '../../services/notes';
import { attendanceService } from '../../services/attendance';
import { paymentService } from '../../services/payments';
import { classService } from '../../services/classes';
import { extractData } from '../../lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Users, School, UserCheck, BookOpen,
  CalendarDays, Calendar, UserX, FileText, Award, CreditCard,
  ClipboardCheck, AlertTriangle, Heart, UserCog, Settings, Building, Circle,
  Upload, Archive, BarChart3, CalendarPlus, GraduationCap,
};

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

const PREFETCH_MAP: Record<string, (queryClient: ReturnType<typeof useQueryClient>) => void> = {
  '/students': (qc) => qc.prefetchQuery({ queryKey: ['students'], queryFn: () => studentService.getStudents().then(res => extractData(res)), staleTime: 30_000 }),
  '/notes': (qc) => qc.prefetchQuery({ queryKey: ['notes', undefined], queryFn: () => notesService.getNotes(undefined).then(res => extractData(res)), staleTime: 30_000 }),
  '/absences': (qc) => qc.prefetchQuery({ queryKey: ['attendance-sessions'], queryFn: () => attendanceService.getAttendanceSessions().then(res => extractData(res)), staleTime: 30_000 }),
  '/payments': (qc) => qc.prefetchQuery({ queryKey: ['payments', undefined], queryFn: () => paymentService.getPayments(undefined).then(res => extractData(res)), staleTime: 30_000 }),
  '/classes': (qc) => qc.prefetchQuery({ queryKey: ['classes'], queryFn: () => classService.getClasses().then(res => extractData(res)), staleTime: 30_000 }),
};

export function Sidebar({ collapsed, onToggleCollapse, onLogout }: SidebarProps) {
  const { user, activeRole } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const queryClient = useQueryClient();

  const role = activeRole || user?.role || 'PARENT';
  const filteredNav = useMemo(
    () => NAV_CONFIG.filter(item => item.roles.includes(role)),
    [role]
  );

  const handlePrefetch = useCallback((path: string) => {
    PREFETCH_MAP[path]?.(queryClient);
  }, [queryClient]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      <div className={`flex items-center gap-3 mb-8 px-2 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
          <Logo className="text-primary w-6 h-6" />
        </div>
        <div className={`text-2xl font-heading font-bold text-primary transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
          EduCIV
        </div>
      </div>

      <nav className="flex-grow space-y-1" aria-label="Navigation principale">
        {filteredNav.map(item => {
          const IconComponent = ICON_MAP[item.icon || 'Circle'];
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={() => handlePrefetch(item.path)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-text hover:bg-primary/5 hover:text-primary'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-text/50 group-hover:text-primary'}`} />
              <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {!collapsed && (
          <>
            <div className="text-[10px] font-bold text-text/30 uppercase tracking-[0.2em] mt-8 mb-3 px-3">
              Session
            </div>
            <div className="mb-3 px-3">
              <SchoolSwitcher />
            </div>
            <div className="mb-1 px-3">
              <RoleSwitcher />
            </div>
            <div className="px-3 mb-4">
              <div className="text-sm font-semibold text-text truncate">{user?.name || user?.email}</div>
              <div className="text-[10px] text-text/50 font-medium uppercase tracking-wider">{role}</div>
            </div>
          </>
        )}
      </nav>

      <div className={`flex flex-col gap-2 ${collapsed ? 'items-center' : ''}`}>
        <button
          onClick={onToggleCollapse}
          className="text-text/50 hover:text-text p-2 rounded-lg hover:bg-surface transition-colors duration-200"
          aria-label={collapsed ? 'Étendre le menu' : 'Réduire le menu'}
          title={collapsed ? 'Étendre' : 'Réduire'}
        >
          <Menu className="w-5 h-5 rotate-180" />
        </button>

        <button
          onClick={onLogout}
          className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold p-3 rounded-xl transition-all duration-200 flex items-center gap-3 group w-full"
          aria-label="Déconnexion"
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1" />
          <span className={`whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            Déconnexion
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-bg-elevated rounded-xl shadow-2 flex items-center justify-center"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5 text-text" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 p-4 flex flex-col bg-bg-elevated border-r border-border z-50 transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-text/50 hover:text-text rounded-lg hover:bg-surface transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        ref={sidebarRef}
        className={`hidden md:flex flex-col p-4 m-4 rounded-2xl border border-border bg-bg-elevated shrink-0 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[280px]'
        }`}
        aria-label="Navigation principale"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
