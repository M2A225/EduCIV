import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { NAV_CONFIG } from '../../config/navigation';
import {
  Search, Bell, Sun, Moon, Monitor, ChevronDown, LogOut, User,
  Settings,
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar: () => void;
  collapsed: boolean;
}

function getBreadcrumb(pathname: string): string {
  const flatNav = NAV_CONFIG.map(item => ({ path: item.path, label: item.label }));
  const match = flatNav.find(item => item.path === pathname);
  if (match) return match.label;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Dashboard';
  if (segments[0] === 'settings' && segments[1]) {
    const subMatch = flatNav.find(item => item.path === `/settings/${segments[1]}`);
    if (subMatch) return subMatch.label;
  }
  const label = segments[segments.length - 1]
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return label;
}

const themeIcons: Record<string, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const themeLabels: Record<string, string> = {
  light: 'Clair',
  dark: 'Sombre',
  system: 'Système',
};

export function TopBar({ onToggleSidebar, collapsed }: TopBarProps) {
  const { user, activeRole, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  const breadcrumb = getBreadcrumb(location.pathname);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const toggleTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setThemeMenuOpen(false);
  }, [setTheme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setThemeMenuOpen(false);
        setCmdPaletteOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const ThemeIcon = themeIcons[theme] || Sun;

  return (
    <header className="sticky top-0 z-30 h-16 bg-bg-elevated/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-full px-4 md:px-6 gap-4">
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex w-8 h-8 items-center justify-center text-text/40 hover:text-text rounded-lg hover:bg-surface transition-colors"
            aria-label={collapsed ? 'Étendre le menu' : 'Réduire le menu'}
          >
            <span className={`text-lg transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}>
              ☰
            </span>
          </button>
          <nav className="flex items-center gap-2 text-sm min-w-0" aria-label="Fil d'Ariane">
            <span className="text-text-muted">EduCIV</span>
            <span className="text-text-muted">/</span>
            <span className="text-text font-medium truncate">{breadcrumb}</span>
          </nav>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {/* Search trigger */}
          <button
            onClick={() => setCmdPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted bg-surface rounded-lg hover:bg-surface-hover transition-colors border border-border"
            aria-label="Rechercher (Cmd+K)"
          >
            <Search className="w-4 h-4" />
            <span>Rechercher...</span>
            <kbd className="text-[10px] px-1.5 py-0.5 bg-bg-elevated rounded border border-border font-mono ml-4">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => setCmdPaletteOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
            aria-label="Rechercher"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            className="relative w-9 h-9 flex items-center justify-center text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-cta rounded-full" />
          </button>

          {/* Theme toggle */}
          <div className="relative">
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
              aria-label="Changer de thème"
              title={`Thème : ${themeLabels[theme]}`}
            >
              <ThemeIcon className="w-4 h-4" />
            </button>

            {themeMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-40 bg-bg-elevated rounded-xl border border-border shadow-3 z-50 py-1 animate-scale-in origin-top-right">
                  {(['light', 'dark', 'system'] as const).map(t => {
                    const Icon = themeIcons[t];
                    const isActive = theme === t;
                    return (
                      <button
                        key={t}
                        onClick={() => toggleTheme(t)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isActive
                            ? 'text-primary bg-primary/5'
                            : 'text-text hover:bg-surface'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{themeLabels[t]}</span>
                        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-surface transition-colors"
              aria-label="Menu utilisateur"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-sm font-medium text-text max-w-[120px] truncate">
                {user?.name || user?.email}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-bg-elevated rounded-xl border border-border shadow-3 z-50 py-1 animate-scale-in origin-top-right">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="text-sm font-semibold text-text truncate">{user?.name || user?.email}</div>
                    <div className="text-xs text-text-muted truncate">{user?.email}</div>
                    <div className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{activeRole || user?.role}</div>
                  </div>

                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface transition-colors">
                    <User className="w-4 h-4" />
                    <span>Profil</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Paramètres</span>
                  </button>

                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Command palette modal — placeholder */}
      {cmdPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-black/40" onClick={() => setCmdPaletteOpen(false)} />
          <div className="relative w-full max-w-lg bg-bg-elevated rounded-2xl border border-border shadow-4 overflow-hidden animate-scale-in">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-text-muted" />
              <input
                autoFocus
                placeholder="Rechercher une page..."
                className="flex-1 bg-transparent border-none outline-none text-text text-sm placeholder:text-text-muted"
              />
            </div>
            <div className="p-2">
              <p className="text-xs text-text-muted text-center py-8">Tapez pour rechercher...</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
