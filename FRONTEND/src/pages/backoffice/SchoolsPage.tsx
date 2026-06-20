import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { SearchBar } from '../../components/ui/SearchBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { SchoolFormModal } from '../../components/backoffice/SchoolFormModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useSchools, useDeleteSchool } from '../../hooks/useSchools';
import type { School } from '../../types';
import { Trash2, Pencil, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BackofficeSchools = () => {
  const { data, isLoading } = useSchools();
  const deleteSchool = useDeleteSchool();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState<'create' | 'edit' | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<School | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const uniqueTypes = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((s: School) => s.type).filter(Boolean))] as string[];
  }, [data]);

  const uniqueCities = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((s: School) => s.city).filter(Boolean))] as string[];
  }, [data]);

  const filteredSchools = useMemo(() => {
    if (!data) return [];
    return data.filter((s: School) => {
      const matchSearch = !searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.school_id).includes(searchTerm);
      const matchType = !filterType || s.type === filterType;
      const matchCity = !filterCity || s.city === filterCity;
      const matchDateFrom = !dateFrom || (s.created_at && new Date(s.created_at) >= new Date(dateFrom));
      const matchDateTo = !dateTo || (s.created_at && new Date(s.created_at) <= new Date(dateTo + 'T23:59:59'));
      return matchSearch && matchType && matchCity && matchDateFrom && matchDateTo;
    });
  }, [data, searchTerm, filterType, filterCity, dateFrom, dateTo]);

  const handleEdit = (school: School) => {
    setSelectedSchool(school);
    setModalOpen('edit');
  };

  const handleManage = (school: School) => {
    navigate(`/backoffice/schools/${school.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSchool.mutateAsync(deleteTarget.id);
    } catch { toast.error('Impossible de supprimer l\'école'); }
    setDeleteTarget(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterCity('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchTerm || filterType || filterCity || dateFrom || dateTo;

  const columns = [
    { header: 'ID', accessor: (s: School) => <span className="font-medium text-text">{s.id}</span> },
    { header: 'School ID', accessor: (s: School) => s.school_id },
    { header: 'Nom', accessor: (s: School) => s.name },
    { header: 'Ville', accessor: (s: School) => s.city || '-' },
    { header: 'Téléphone', accessor: (s: School) => s.phone || '-' },
    { header: 'Email', accessor: (s: School) => s.email || '-' },
    { header: 'Type', accessor: (s: School) => s.type || '-' },
    { header: 'Créé le', accessor: (s: School) => s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : '-' },
    {
      header: 'Actions',
      accessor: (s: School) => (
        <div className="flex gap-2">
          <Button variant="glass" className="py-1 text-xs px-3" onClick={() => handleEdit(s)}>
            <Pencil className="w-3 h-3 mr-1" /> Modifier
          </Button>
          <Button variant="primary" className="py-1 text-xs px-3" onClick={() => handleManage(s)}>
            <Settings className="w-3 h-3 mr-1" /> Gérer
          </Button>
          <Button variant="outline" className="py-1 text-xs px-3 border-red-200 text-red-600 hover:bg-red-50" isLoading={deleteSchool.isPending} onClick={() => setDeleteTarget(s)}>
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
        title="Gestion des Écoles"
        subtitle={`${filteredSchools.length} école(s)`}
        actions={
          <Button variant="primary" onClick={() => { setSelectedSchool(null); setModalOpen('create'); }}>
            + Nouvelle École
          </Button>
        }
      />

      <Card className="p-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Rechercher par nom ou ID..."
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(prev => !prev)}
          hasActiveFilters={!!hasActiveFilters}
          onResetFilters={resetFilters}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: '', label: 'Tous' },
                ...uniqueTypes.map(t => ({ value: t, label: t })),
              ]}
            />
            <Select
              label="Ville"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              options={[
                { value: '', label: 'Toutes' },
                ...uniqueCities.map(c => ({ value: c, label: c })),
              ]}
            />
            <div>
              <label className="block text-sm font-heading font-semibold text-text mb-1.5">Du</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-white/50 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold text-text mb-1.5">Au</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-white/50 outline-none text-sm"
              />
            </div>
          </div>
        </SearchBar>
      </Card>

      <Card className="overflow-hidden">
        <Table data={filteredSchools} columns={columns} />
      </Card>

      {modalOpen === 'create' && (
        <SchoolFormModal onClose={() => setModalOpen(null)} />
      )}
      {modalOpen === 'edit' && selectedSchool && (
        <SchoolFormModal school={selectedSchool} onClose={() => { setModalOpen(null); setSelectedSchool(null); }} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer l'école"
        message={`Supprimer l'école "${deleteTarget?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteSchool.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};