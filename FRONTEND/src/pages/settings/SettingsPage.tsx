import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../components/providers/ThemeProvider';
import { Settings, Moon, Sun, Monitor, User, School } from 'lucide-react';

export const SettingsPage = () => {
  const { user, activeRole, availableRoles } = useAuth();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" subtitle="Configurez votre expérience utilisateur" />

      <div className="grid gap-6 max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-text-muted">Nom</span>
                <span className="text-sm font-medium">{user?.name || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-text-muted">Email</span>
                <span className="text-sm font-medium">{user?.email || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-text-muted">Rôle actif</span>
                <span className="text-sm font-medium px-2 py-1 rounded-lg bg-primary/10 text-primary">
                  {activeRole}
                </span>
              </div>
              {availableRoles.length > 1 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-text-muted">Rôles disponibles</span>
                  <span className="text-sm font-medium">{availableRoles.join(', ')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-text-muted">Thème</p>
              <div className="flex gap-3">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                      theme === value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              École
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-muted">
              École actuelle : <span className="font-medium text-text">École active (ID: {user?.school_id})</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
