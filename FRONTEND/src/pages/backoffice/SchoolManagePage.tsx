import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SearchBar } from '../../components/ui/SearchBar';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { UserFormModal } from '../../components/director/UserFormModal';
import { AddStudentModal } from '../../components/director/AddStudentModal';
import { useAuth } from '../../hooks/useAuth';
import { useSchoolStats, useSchools } from '../../hooks/useSchools';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import { useClasses, useCreateClass, useDeleteClass } from '../../hooks/useClasses';
import { useTeachers, useCreateTeacher, useDeleteTeacher } from '../../hooks/useTeachers';
import { useStudents } from '../../hooks/useStudents';
import { schoolService } from '../../services/schools';
import type { User, School, SchoolStats, Class, Teacher, Student, CreateClassDto } from '../../types';
import {
  Users, School as SchoolIcon, CreditCard, Activity, AlertTriangle,
  ArrowLeft, UserPlus, BookOpen, ClipboardList, Settings,
  Trash2, Pencil, PlusCircle, GraduationCap, RefreshCw
} from 'lucide-react';

type Tab = 'dashboard' | 'users' | 'students' | 'classes' | 'teachers';

export const SchoolManagePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const schoolId = Number(id);
  const { setCurrentSchoolId, currentSchoolId: originalSchoolId } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    if (schoolId) setCurrentSchoolId(schoolId);
    return () => {
      if (originalSchoolId) setCurrentSchoolId(originalSchoolId);
    };
  }, []);

  const { data: schools } = useSchools();
  const { data: stats, isLoading: statsLoading } = useSchoolStats(schoolId);

  const school = useMemo(() => {
    if (!Array.isArray(schools)) return null;
    return schools.find((s: School) => s.id === schoolId);
  }, [schools, schoolId]);

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'dashboard', label: 'Tableau de bord', icon: Activity },
    { key: 'users', label: 'Utilisateurs', icon: Users },
    { key: 'students', label: 'Élèves', icon: BookOpen },
    { key: 'classes', label: 'Classes', icon: SchoolIcon },
    { key: 'teachers', label: 'Professeurs', icon: GraduationCap },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={school?.name || `École #${schoolId}`}
        subtitle={`${school?.city || ''}${school?.type ? ` — ${school.type}` : ''}${school?.school_id ? ` — ID: ${school.school_id}` : ''}`}
        actions={
          <div className="flex gap-2">
            <Button variant="glass" aria-label="Retour" onClick={() => navigate('/backoffice/schools')} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={() => navigate(`/settings`)} className="gap-2">
              <Settings className="w-4 h-4" /> Paramètres
            </Button>
          </div>
        }
      />

      <div className="flex gap-1 bg-primary/5 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-text/60 hover:text-text hover:bg-white/50'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <DashboardTab stats={stats} statsLoading={statsLoading} school={school} navigate={navigate} onTabChange={setActiveTab} />
      )}
      {activeTab === 'users' && (
        <UsersTab schoolId={schoolId} />
      )}
      {activeTab === 'students' && (
        <StudentsTab />
      )}
      {activeTab === 'classes' && (
        <ClassesTab />
      )}
      {activeTab === 'teachers' && (
        <TeachersTab />
      )}
    </div>
  );
};

interface DashboardTabProps {
  stats: SchoolStats | undefined;
  statsLoading: boolean;
  school: School | null;
  onTabChange: (tab: Tab) => void;
}

function DashboardTab({ stats, statsLoading, school, onTabChange }: DashboardTabProps) {
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  if (statsLoading) return <LoadingState type="card" count={4} />;

  const statItems = [
    { label: 'Total Élèves', value: stats?.totalStudents || 0, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Classes', value: stats?.totalClasses || 0, icon: SchoolIcon, color: 'text-primary', bg: 'bg-primary/10' },
    { label: "Paiements (Aujourd'hui)", value: `${stats?.todayPayments || 0} FCFA`, icon: CreditCard, color: 'text-cta', bg: 'bg-cta/10' },
    { label: 'Taux Présence', value: `${stats?.attendanceRate || 0}%`, icon: Activity, color: 'text-text', bg: 'bg-text/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }, i: number) => (
          <Card key={i} className="border border-primary/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-text/40 uppercase tracking-widest">{item.label}</p>
                  <p className={`text-2xl font-heading font-bold mt-2 ${item.color}`}>{item.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${item.bg}`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-cta" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(stats?.alerts && stats.alerts.length > 0) ? (
                stats.alerts.map((alert: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{alert}</span>
                  </li>
                ))
              ) : (
                <li className="text-text/40 text-sm text-center py-8">Aucune alerte</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-primary" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickActionButton icon={Users} label="Utilisateurs" desc="Gérer" onClick={() => onTabChange('users')} />
              <QuickActionButton icon={BookOpen} label="Élèves" desc="Gérer" onClick={() => onTabChange('students')} />
              <QuickActionButton icon={GraduationCap} label="Professeurs" desc="Gérer" onClick={() => onTabChange('teachers')} />
              <QuickActionButton icon={ClipboardList} label="Classes" desc="Gérer" onClick={() => onTabChange('classes')} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset setup — accessible aux BACKOFFICE */}
      <Card className="border border-red-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <RefreshCw className="w-5 h-5" />
            Configuration de l'école
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text/60 mb-4">
            Réinitialiser la configuration obligera le directeur et le comptable à repasser l'assistant de configuration.
            Les classes, utilisateurs, notes et paiements existants seront conservés.
          </p>
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setResetOpen(true)}>
            <RefreshCw className="w-4 h-4 mr-2" /> Réinitialiser la configuration
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={resetOpen}
        title="Réinitialiser la configuration"
        message={`Réinitialiser la configuration de "${school?.name || 'cette école'}" ? Cette action va effacer les niveaux, filières, matières, plans de paiement et la grille tarifaire. Les classes, utilisateurs, notes et paiements existants seront conservés.`}
        confirmLabel="Confirmer la réinitialisation"
        variant="danger"
        loading={resetting}
        onConfirm={async () => {
          setResetting(true);
          try {
            await schoolService.resetSetup(school?.id || 0);
            toast.success('Configuration réinitialisée avec succès. Le directeur devra repasser l\'assistant.');
            setResetOpen(false);
          } catch {
            toast.error('Erreur lors de la réinitialisation');
          } finally {
            setResetting(false);
          }
        }}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  onClick: () => void;
}

function QuickActionButton({ icon: Icon, label, desc, onClick }: QuickActionButtonProps) {
  return (
    <Button variant="glass" className="flex items-center gap-3 h-14 justify-start" onClick={onClick}>
      <Icon className="w-5 h-5 text-primary shrink-0" />
      <div className="text-left">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-text/40">{desc}</p>
      </div>
    </Button>
  );
}

function UsersTab({ schoolId }: { schoolId: number }) {
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.toLowerCase();
    return users.filter((u: User) =>
      u.school_id === schoolId && (
        !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      )
    );
  }, [users, search, schoolId]);

  if (isLoading) return <LoadingState type="list" count={5} />;

  const columns = [
    { header: 'Nom', accessor: (u: User) => <span className="font-medium">{u.name || '-'}</span> },
    { header: 'Email', accessor: (u: User) => u.email },
    { header: 'Rôle', accessor: (u: User) => <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary">{u.role}</span> },
    { header: 'Téléphone', accessor: (u: User) => u.phone || '-' },
    {
      header: 'Actions',
      accessor: (u: User) => (
        <div className="flex gap-2">
          <Button variant="glass" className="py-1 text-xs px-3" onClick={() => { setSelectedUser(u); setModalOpen(true); }}>
            <Pencil className="w-3 h-3 mr-1" /> Modifier
          </Button>
          <Button variant="outline" className="py-1 text-xs px-3 border-red-200 text-red-600" isLoading={deleteUser.isPending} onClick={() => setDeleteTarget(u)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher..."
        />
        <Button variant="primary" onClick={() => { setSelectedUser(null); setModalOpen(true); }}>
          <PlusCircle className="w-4 h-4 mr-2" /> Nouvel Utilisateur
        </Button>
      </div>
      <Card className="overflow-hidden">
        <Table data={filtered} columns={columns} />
      </Card>
      {modalOpen && (
        <UserFormModal
          user={selectedUser}
          onClose={() => { setModalOpen(false); setSelectedUser(null); }}
        />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer l'utilisateur"
        message={`Supprimer ${deleteTarget?.email} ?`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteUser.isPending}
        onConfirm={() => { if (deleteTarget) deleteUser.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function StudentsTab() {
  const { data: students, isLoading } = useStudents();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!students) return [];
    const q = search.toLowerCase();
    return students.filter((s: Student) => !q || s.name?.toLowerCase().includes(q) || s.matricule?.toLowerCase().includes(q));
  }, [students, search]);

  if (isLoading) return <LoadingState type="list" count={5} />;

  const columns: Column<Student>[] = [
    { header: 'Matricule', accessor: (s: Student) => s.matricule || '-' },
    { header: 'Nom', accessor: (s: Student) => <span className="font-medium">{s.name}</span> },
    { header: 'Sexe', accessor: (s: Student) => s.sexe || '-' },
    { header: 'Classe', accessor: (s: Student) => s.class?.name || `#${s.class_id || '-'}` },
    { header: 'Régime', accessor: (s: Student) => s.regime || '-' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher par nom ou matricule..."
        />
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" /> Ajouter Élève
        </Button>
      </div>
      <Card className="overflow-hidden">
        <Table data={filtered} columns={columns} />
      </Card>
      {modalOpen && <AddStudentModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function ClassesTab() {
  const { data: classes, isLoading } = useClasses();
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [searchClasses, setSearchClasses] = useState('');
  const [showFiltersClasses, setShowFiltersClasses] = useState(false);
  const [levelFilter, setLevelFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Class | null>(null);

  const levels = [...new Set((classes || []).map((c: Class) => c.level).filter(Boolean))] as string[];
  const sections = [...new Set((classes || []).map((c: Class) => c.section).filter(Boolean))] as string[];

  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    return classes.filter((c: Class) => {
      if (searchClasses && !c.name.toLowerCase().includes(searchClasses.toLowerCase())) return false;
      if (levelFilter && c.level !== levelFilter) return false;
      if (sectionFilter && c.section !== sectionFilter) return false;
      return true;
    });
  }, [classes, searchClasses, levelFilter, sectionFilter]);

  const handleCreate = async () => {
    if (!name) return;
    try {
      await createClass.mutateAsync({ name, level: level || undefined } as CreateClassDto);
      setName('');
      setLevel('');
    } catch { toast.error('Impossible de créer la classe'); }
  };

  if (isLoading) return <LoadingState type="list" count={5} />;

  const columns: Column<Class>[] = [
    { header: 'Nom', accessor: (c: Class) => <span className="font-medium">{c.name}</span> },
    { header: 'Niveau', accessor: (c: Class) => c.level || '-' },
    { header: 'Section', accessor: (c: Class) => c.section || '-' },
    { header: 'Capacité', accessor: (c: Class) => c.capacity || '-' },
    { header: 'Élèves', accessor: (c: Class) => c._count?.students ?? '-' },
    {
      header: 'Actions',
      accessor: (c: Class) => (
        <Button variant="outline" className="py-1 text-xs px-3 border-red-200 text-red-600" isLoading={deleteClass.isPending} onClick={() => setDeleteTarget(c)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchClasses}
        onChange={setSearchClasses}
        placeholder="Rechercher une classe..."
        showFilters={showFiltersClasses}
        onToggleFilters={() => setShowFiltersClasses(prev => !prev)}
        hasActiveFilters={!!(levelFilter || sectionFilter)}
        onResetFilters={() => { setLevelFilter(''); setSectionFilter(''); }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            placeholder="Niveau"
            options={[{ value: '', label: 'Tous les niveaux' }, ...levels.map(l => ({ value: l, label: l }))]}
          />
          <Select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            placeholder="Section"
            options={[{ value: '', label: 'Toutes les sections' }, ...sections.map(s => ({ value: s, label: s }))]}
          />
        </div>
      </SearchBar>
      <Card className="p-4">
        <div className="flex items-end gap-4">
          <Input label="Nom de la classe" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: 6ème A" />
          <Input label="Niveau" value={level} onChange={e => setLevel(e.target.value)} placeholder="Ex: 6ème" />
          <Button variant="primary" onClick={handleCreate} isLoading={createClass.isPending} className="mb-0.5">
            <PlusCircle className="w-4 h-4 mr-2" /> Ajouter
          </Button>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <Table data={filteredClasses} columns={columns} />
      </Card>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer la classe"
        message={`Supprimer la classe "${deleteTarget?.name}" ?`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteClass.isPending}
        onConfirm={() => { if (deleteTarget) deleteClass.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function TeachersTab() {
  const { data: teachers, isLoading } = useTeachers();
  const createTeacher = useCreateTeacher();
  const deleteTeacher = useDeleteTeacher();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', grade: '', specialty: '' });
  const [searchTeachers, setSearchTeachers] = useState('');
  const [showFiltersTeachers, setShowFiltersTeachers] = useState(false);
  const [gradeFilter, setGradeFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const grades = [...new Set((teachers || []).map((t: Teacher) => t.grade).filter(Boolean))] as string[];
  const specialties = [...new Set((teachers || []).map((t: Teacher) => t.specialty).filter(Boolean))] as string[];

  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];
    return teachers.filter((t: Teacher) => {
      const q = searchTeachers.toLowerCase();
      if (q && !t.name?.toLowerCase().includes(q) && !t.email?.toLowerCase().includes(q)) return false;
      if (gradeFilter && t.grade !== gradeFilter) return false;
      if (specialtyFilter && t.specialty !== specialtyFilter) return false;
      return true;
    });
  }, [teachers, searchTeachers, gradeFilter, specialtyFilter]);

  const handleCreate = async () => {
    if (!form.name) return;
    try {
      await createTeacher.mutateAsync(form);
      setForm({ name: '', phone: '', email: '', grade: '', specialty: '' });
      setShowForm(false);
    } catch { toast.error('Impossible de créer l\'enseignant'); }
  };

  if (isLoading) return <LoadingState type="list" count={5} />;

  const columns: Column<Teacher>[] = [
    { header: 'Nom', accessor: (t: Teacher) => <span className="font-medium">{t.name}</span> },
    { header: 'Email', accessor: (t: Teacher) => t.email || '-' },
    { header: 'Téléphone', accessor: (t: Teacher) => t.phone || '-' },
    { header: 'Grade', accessor: (t: Teacher) => t.grade || '-' },
    { header: 'Spécialité', accessor: (t: Teacher) => t.specialty || '-' },
    {
      header: 'Actions',
      accessor: (t: Teacher) => (
        <Button variant="outline" className="py-1 text-xs px-3 border-red-200 text-red-600" isLoading={deleteTeacher.isPending} onClick={() => setDeleteTarget(t)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SearchBar
          value={searchTeachers}
          onChange={setSearchTeachers}
          placeholder="Rechercher un professeur..."
          showFilters={showFiltersTeachers}
          onToggleFilters={() => setShowFiltersTeachers(prev => !prev)}
          hasActiveFilters={!!(gradeFilter || specialtyFilter)}
          onResetFilters={() => { setGradeFilter(''); setSpecialtyFilter(''); }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              placeholder="Grade"
              options={[{ value: '', label: 'Tous les grades' }, ...grades.map(g => ({ value: g, label: g }))]}
            />
            <Select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              placeholder="Spécialité"
              options={[{ value: '', label: 'Toutes les spécialités' }, ...specialties.map(s => ({ value: s, label: s }))]}
            />
          </div>
        </SearchBar>
        <Button variant="primary" onClick={() => setShowForm(prev => !prev)}>
          <PlusCircle className="w-4 h-4 mr-2" /> Ajouter Professeur
        </Button>
      </div>
      {showForm && (
        <Card className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Input label="Nom *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Téléphone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input label="Grade" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} />
            <Input label="Spécialité" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} />
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleCreate} isLoading={createTeacher.isPending}>Créer</Button>
          </div>
        </Card>
      )}
      <Card className="overflow-hidden">
        <Table data={filteredTeachers} columns={columns} />
      </Card>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer le professeur"
        message={`Supprimer le professeur "${deleteTarget?.name}" ?`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteTeacher.isPending}
        onConfirm={() => { if (deleteTarget) deleteTeacher.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}