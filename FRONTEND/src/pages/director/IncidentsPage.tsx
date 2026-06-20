import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { SearchBar } from '../../components/ui/SearchBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useIncidents } from '../../hooks/useIncidents';
import type { Incident } from '../../types';

const typeLabels: Record<string, string> = {
  RETARD: 'Retard',
  ABSENCE_NON_JUSTIFIEE: 'Absence non justifiée',
  COMPORTEMENT: 'Comportement',
  AUTRE: 'Autre',
};

const statusLabels: Record<string, string> = {
  EN_COURS: 'En cours',
  RESOLU: 'Résolu',
  IGNORE: 'Ignoré',
};

const statusVariant: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
  EN_COURS: 'yellow',
  RESOLU: 'green',
  IGNORE: 'gray',
};

export const IncidentsPage = () => {
  const { data: incidents, isLoading } = useIncidents();
  const [search, setSearch] = useState('');

  const filteredIncidents = useMemo(() => {
    if (!search) return incidents || [];
    const q = search.toLowerCase();
    return (incidents || []).filter((r: Incident) =>
      r.description.toLowerCase().includes(q) ||
      (typeLabels[r.type] || r.type).toLowerCase().includes(q) ||
      (statusLabels[r.status] || r.status).toLowerCase().includes(q)
    );
  }, [incidents, search]);

  const columns = [
    { header: 'Type', accessor: (row: Incident) => <span className="font-medium text-text">{typeLabels[row.type] || row.type}</span> },
    { header: 'Description', accessor: (row: Incident) => <span className="text-sm max-w-xs truncate">{row.description}</span> },
    { header: 'Date', accessor: (row: Incident) => <span className="text-sm">{new Date(row.date).toLocaleDateString('fr-FR')}</span> },
    {
      header: 'Statut',
      accessor: (row: Incident) => (
        <StatusBadge status={statusLabels[row.status] || row.status} variant={statusVariant[row.status] || 'gray'} />
      ),
    },
  ];

  if (isLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Incidents"
        subtitle={`${filteredIncidents.length} incident(s)`}
      />

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un incident..." />

      <Card className="overflow-hidden">
        <Table data={filteredIncidents} columns={columns} />
      </Card>
    </div>
  );
};
