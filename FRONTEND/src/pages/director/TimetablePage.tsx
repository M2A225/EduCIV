import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../services/api';

export const TimetablePage = () => {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['timetable'],
    queryFn: () => api.get('/timetables').then(res => res.data.data),
  });

  const columns = [
    { header: 'Slot', accessor: (row: any) => row.slot },
    { header: 'Classe ID', accessor: (row: any) => row.class_id },
    { header: 'Matière ID', accessor: (row: any) => row.subject_id },
    { header: 'Prof ID', accessor: (row: any) => row.teacher_id },
  ];

  if (isLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Emploi du Temps</h1>
        <Button onClick={() => setShowForm(!showForm)}>+ Ajouter Séance</Button>
      </div>

      <Card>
        <Table data={data || []} columns={columns} />
      </Card>
    </div>
  );
};
