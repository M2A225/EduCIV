import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Search, Users, School, CreditCard, FileText, BarChart3, Settings, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const allCommands = [
  { label: 'Tableau de bord', path: '/', icon: BarChart3, roles: ['DIRECTOR'] },
  { label: 'Élèves', path: '/students', icon: Users, roles: ['DIRECTOR', 'TEACHER', 'EDUCATOR'] },
  { label: 'Classes', path: '/classes', icon: School, roles: ['DIRECTOR', 'TEACHER'] },
  { label: 'Enseignants', path: '/teachers', icon: Users, roles: ['DIRECTOR'] },
  { label: 'Parents', path: '/parents', icon: Users, roles: ['DIRECTOR'] },
  { label: 'Paiements', path: '/payments', icon: CreditCard, roles: ['DIRECTOR', 'CASHIER', 'ACCOUNTANT'] },
  { label: 'Notes', path: '/notes', icon: FileText, roles: ['DIRECTOR', 'TEACHER'] },
  { label: 'Présences', path: '/absences', icon: Users, roles: ['DIRECTOR', 'TEACHER', 'EDUCATOR'] },
  { label: 'Bulletins', path: '/bulletins', icon: FileText, roles: ['DIRECTOR'] },
  { label: 'Incidents', path: '/incidents', icon: FileText, roles: ['DIRECTOR', 'EDUCATOR'] },
  { label: 'Emploi du temps', path: '/timetables', icon: School, roles: ['DIRECTOR', 'TEACHER', 'STUDENT'] },
  { label: 'Périodes', path: '/periods', icon: School, roles: ['DIRECTOR'] },
  { label: 'Années scolaires', path: '/school-years', icon: School, roles: ['DIRECTOR'] },
  { label: 'Import bulk', path: '/import', icon: Users, roles: ['DIRECTOR'] },
  { label: 'Statistiques', path: '/statistics', icon: BarChart3, roles: ['DIRECTOR'] },
  { label: 'Profil', path: '/profile', icon: User, roles: [] },
  { label: 'Paramètres', path: '/user-settings', icon: Settings, roles: [] },
  { label: 'Paramètres école', path: '/settings/filieres', icon: Settings, roles: ['DIRECTOR'] },
  { label: 'Tableau de bord (Comptable)', path: '/accountant', icon: BarChart3, roles: ['ACCOUNTANT'] },
  { label: 'Tableau de bord (Caissier)', path: '/cashier', icon: BarChart3, roles: ['CASHIER'] },
  { label: 'Tableau de bord (Éducateur)', path: '/educator', icon: BarChart3, roles: ['EDUCATOR'] },
  { label: 'Tableau de bord (Parent)', path: '/parent', icon: BarChart3, roles: ['PARENT'] },
  { label: 'Tableau de bord (Élève)', path: '/student', icon: BarChart3, roles: ['STUDENT'] },
  { label: 'Backoffice', path: '/backoffice', icon: Settings, roles: ['BACKOFFICE'] },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { activeRole, user } = useAuth();

  const commands = useMemo(() => {
    const role = activeRole || user?.role;
    return allCommands.filter(cmd =>
      cmd.roles.length === 0 || cmd.roles.includes(role as any)
    );
  }, [activeRole, user]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <Command
        className="relative w-full max-w-lg bg-bg-elevated rounded-2xl border border-border shadow-4 overflow-hidden animate-scale-in"
        loop
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-text-muted" />
          <Command.Input
            autoFocus
            placeholder="Rechercher une page..."
            className="flex-1 bg-transparent border-none outline-none text-text text-sm placeholder:text-text-muted"
          />
        </div>
        <Command.List className="p-2 max-h-80 overflow-y-auto">
          <Command.Empty className="text-xs text-text-muted text-center py-8">
            Aucun résultat trouvé
          </Command.Empty>
          {commands.map((cmd) => (
            <Command.Item
              key={cmd.path}
              value={cmd.label}
              onSelect={() => handleSelect(cmd.path)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer text-text hover:bg-surface transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
            >
              <cmd.icon className="w-4 h-4 text-text-muted" />
              <span>{cmd.label}</span>
            </Command.Item>
          ))}
        </Command.List>
        <div className="border-t border-border px-4 py-2 flex items-center justify-between">
          <span className="text-[10px] text-text-muted">
            <kbd className="px-1 py-0.5 bg-surface rounded border border-border font-mono">↑↓</kbd> naviguer
            <span className="mx-2">·</span>
            <kbd className="px-1 py-0.5 bg-surface rounded border border-border font-mono">↵</kbd> sélectionner
            <span className="mx-2">·</span>
            <kbd className="px-1 py-0.5 bg-surface rounded border border-border font-mono">esc</kbd> fermer
          </span>
        </div>
      </Command>
    </div>
  );
}
