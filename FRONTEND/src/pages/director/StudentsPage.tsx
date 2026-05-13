import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { api } from '../../services/api';
import { Student } from '../../types';
import { AddStudentModal } from '../../components/director/AddStudentModal';

export const StudentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/students').then(res => res.data.data),
  });

  const columns = [
    { header: 'Nom', accessor: (row: Student) => row.name },
    { header: 'Classe', accessor: (row: Student) => row.class_id || 'N/A' },
    { 
      header: 'Actions', 
      accessor: (row: Student) => <Button variant="outline" className="text-xs">Voir</Button>
    },
  ];

  if (isLoading) return <LoadingState type="list" count={10} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Élèves</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ Ajouter Élève</Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Rechercher par nom..." className="w-64" />
      </div>

      <Card>
        <Table data={data || []} columns={columns} />
      </Card>

      {isModalOpen && <AddStudentModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
