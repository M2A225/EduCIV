import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { SearchBar } from '../../components/ui/SearchBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { UserFormModal } from '../../components/director/UserFormModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import type { User } from '../../types';
import { Trash2, PlusCircle } from 'lucide-react';


export const UsersPage = () => {
  const { data, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter((u: User) =>
      !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try { await deleteUser.mutateAsync(deleteTarget.id); } catch { toast.error('Impossible de supprimer l\'utilisateur'); }
    setDeleteTarget(null);
  };

  const columns = [
    { header: 'Nom', accessor: (row: User) => <span className="font-medium text-text">{row.name || '-'}</span> },
    { header: 'Email', accessor: (row: User) => row.email },
    { header: 'Téléphone', accessor: (row: User) => row.phone || '-' },
    { header: 'Rôle', accessor: (row: User) => (
      <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary">{row.role}</span>
    )},
    {
      header: 'Actions',
      accessor: (row: User) => (
        <Button
          variant="outline"
          className="text-xs px-3 py-1 border-red-200 text-red-600"
          isLoading={deleteUser.isPending}
          onClick={() => setDeleteTarget(row)}
        >
          <Trash2 className="w-3 h-3 mr-1" /> Supprimer
        </Button>
      ),
    },
  ];

  if (isLoading) return <LoadingState type="list" count={10} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Gestion des Utilisateurs"
        subtitle={`${filteredUsers.length} utilisateur(s)`}
        actions={
          <Button onClick={() => setModalOpen(true)} variant="primary" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Créer
          </Button>
        }
      />

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par nom, email ou rôle..." />

      <Card className="overflow-hidden">
        <Table data={filteredUsers || []} columns={columns} />
      </Card>

      {modalOpen && <UserFormModal onClose={() => setModalOpen(false)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer l'utilisateur"
        message={`Supprimer l'utilisateur "${deleteTarget?.email}" ?`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteUser.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};