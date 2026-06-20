import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { UserFormModal } from '../../components/director/UserFormModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import { useSchools } from '../../hooks/useSchools';
import type { User } from '../../types';
import { Trash2, Pencil } from 'lucide-react';

export const BackofficeUsers = () => {
  const { data, isLoading } = useUsers();
  const { data: schools } = useSchools();
  const deleteUser = useDeleteUser();

  const schoolMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (Array.isArray(schools)) schools.forEach(s => { map[s.id] = s.name; });
    return map;
  }, [schools]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState<'create' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const term = searchTerm.toLowerCase();
    return data.filter((u: User) => {
      const matchesSearch = !term || u.email.toLowerCase().includes(term) || (u.name || '').toLowerCase().includes(term) || (u.phone || '').toLowerCase().includes(term);
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [data, searchTerm, roleFilter]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen('edit');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
    } catch { toast.error('Impossible de supprimer l\'utilisateur'); }
    setDeleteTarget(null);
  };

  const columns: Column<User>[] = [
    { header: 'Email', accessor: (u: User) => <span className="font-medium text-text">{u.email}</span> },
    { header: 'Nom', accessor: (u: User) => u.name || '-' },
    { header: 'Téléphone', accessor: (u: User) => u.phone || '-' },
    { header: 'Rôle', accessor: (u: User) => <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">{u.role}</span> },
    { header: 'École', accessor: (u: User) => u.school_id ? (schoolMap[u.school_id] ?? `#${u.school_id}`) : '-' },
    {
      header: 'Actions',
      accessor: (u: User) => (
        <div className="flex gap-2">
          <Button variant="glass" className="py-1 text-xs px-3" onClick={() => handleEdit(u)}>
            <Pencil className="w-3 h-3 mr-1" /> Éditer
          </Button>
          <Button variant="outline" className="py-1 text-xs px-3 border-red-200 text-red-600 hover:bg-red-50" isLoading={deleteUser.isPending} onClick={() => setDeleteTarget(u)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )
    },
  ];

  if (isLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Gestion des Utilisateurs"
        subtitle={`${filteredUsers.length} utilisateur(s)`}
        actions={
          <Button variant="primary" onClick={() => { setSelectedUser(null); setModalOpen('create'); }}>
            + Nouvel Utilisateur
          </Button>
        }
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher par email..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        hasActiveFilters={roleFilter !== 'ALL'}
        onResetFilters={() => setRoleFilter('ALL')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            className="px-4 py-2.5 rounded-xl border border-primary/20 bg-white/50 text-sm outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Tous les rôles</option>
            <option value="DIRECTOR">DIRECTOR</option>
            <option value="TEACHER">TEACHER</option>
            <option value="ACCOUNTANT">ACCOUNTANT</option>
            <option value="CASHIER">CASHIER</option>
            <option value="EDUCATOR">EDUCATOR</option>
            <option value="PARENT">PARENT</option>
            <option value="BACKOFFICE">BACKOFFICE</option>
          </select>
        </div>
      </SearchBar>

      <Card className="overflow-hidden">
        <Table data={filteredUsers} columns={columns} />
      </Card>

      {modalOpen === 'create' && (
        <UserFormModal onClose={() => setModalOpen(null)} />
      )}
      {modalOpen === 'edit' && selectedUser && (
        <UserFormModal user={selectedUser} onClose={() => { setModalOpen(null); setSelectedUser(null); }} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer l'utilisateur"
        message={`Supprimer l'utilisateur "${deleteTarget?.email}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteUser.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};