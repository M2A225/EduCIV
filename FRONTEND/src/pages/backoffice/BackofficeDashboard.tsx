import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { useSchools } from '../../hooks/useSchools';
import { useUsers } from '../../hooks/useUsers';
import { api } from '../../services/api';
import { extractData } from '../../lib/utils';
import { Building2, Users, UserPlus, Building } from 'lucide-react';
import type { SchoolGroup } from '../../types';

export const BackofficeDashboard = () => {
  const { data: schools } = useSchools();
  const { data: users } = useUsers();

  const { data: groups } = useQuery({
    queryKey: ['school-groups-count'],
    queryFn: () => api.get('/school-groups').then(r => extractData<SchoolGroup[]>(r)),
  });

  const stats = [
    {
      label: 'Écoles',
      value: schools?.length ?? 0,
      icon: Building2,
      color: 'bg-info-bg text-info',
      link: '/backoffice/schools',
    },
    {
      label: 'Utilisateurs',
      value: users?.length ?? 0,
      icon: Users,
      color: 'bg-success-bg text-success',
      link: '/backoffice/users',
    },
    {
      label: 'Groupes scolaires',
      value: groups?.length ?? 0,
      icon: Building,
      color: 'bg-primary-bg text-primary',
      link: '/backoffice/school-groups',
    },
  ];

  return (
    <div className="space-y-8 animate-page-enter">
      <PageHeader title="Super Admin - EduCIV" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <Card className="hover:shadow-3 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text">{stat.value}</p>
                    <p className="text-sm text-text-muted">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="hover:shadow-3 transition-all duration-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-heading font-bold mb-6 text-text">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/backoffice/schools?action=create">
              <Button variant="secondary" className="w-full flex items-center gap-3 py-6 text-lg justify-center">
                <Building2 className="w-5 h-5" /> Créer une École
              </Button>
            </Link>
            <Link to="/backoffice/users?action=create">
              <Button variant="secondary" className="w-full flex items-center gap-3 py-6 text-lg justify-center">
                <UserPlus className="w-5 h-5" /> Ajouter un Utilisateur
              </Button>
            </Link>
            <Link to="/backoffice/school-groups">
              <Button variant="secondary" className="w-full flex items-center gap-3 py-6 text-lg justify-center">
                <Building className="w-5 h-5" /> Groupes scolaires
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-3 transition-all duration-300">
        <CardContent className="p-6">
          <h2 className="text-xl font-heading font-bold mb-6 text-text">Gestion Administrative</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/backoffice/schools"><Button variant="secondary" className="w-full">Gérer les Écoles</Button></Link>
            <Link to="/backoffice/users"><Button variant="secondary" className="w-full">Gérer les Utilisateurs</Button></Link>
            <Link to="/backoffice/audit"><Button variant="secondary" className="w-full">Journal d'audit</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
