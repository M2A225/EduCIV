import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { api } from '../../services/api';
import { extractData } from '../../lib/utils';
import type { Student, User, StudentParent } from '../../types';

export const ParentsPage = () => {
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState('');
  const [parentUserId, setParentUserId] = useState('');
  const [relation, setRelation] = useState('');
  const [viewStudentId, setViewStudentId] = useState('');

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await api.get('/students');
      return extractData<Student[]>(res);
    },
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return extractData<User[]>(res).filter((u: User) => u.role === 'PARENT');
    },
  });

  const { data: parentLinks, isLoading: linksLoading } = useQuery({
    queryKey: ['parent-links', viewStudentId],
    queryFn: async () => {
      if (!viewStudentId) return [];
      const res = await api.get(`/parents/student/${viewStudentId}`);
      return extractData<StudentParent[]>(res);
    },
    enabled: !!viewStudentId,
  });

  const linkMutation = useMutation({
    mutationFn: (data: any) => api.post('/parents/link', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-links'] });
      setStudentId('');
      setParentUserId('');
      setRelation('');
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: ({ student_id, parent_user_id }: any) =>
      api.delete(`/parents/unlink/${student_id}/${parent_user_id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parent-links'] }),
  });

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !parentUserId) return;
    try {
      await linkMutation.mutateAsync({
        student_id: Number(studentId),
        parent_user_id: Number(parentUserId),
        relation: relation || undefined,
      });
    } catch { toast.error('Erreur lors de la liaison'); }
  };

  const columns = [
    { header: 'Parent', accessor: (row: any) => row.parent?.name || row.parent?.email || `#${row.parent_user_id}` },
    { header: 'Email parent', accessor: (row: any) => row.parent?.email || '-' },
    { header: 'Relation', accessor: (row: any) => row.relation || '-' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Button
          variant="outline"
          className="text-xs px-3 py-1 border-red-200 text-red-600"
          isLoading={unlinkMutation.isPending}
          onClick={() => unlinkMutation.mutate({ student_id: row.student_id, parent_user_id: row.parent_user_id })}
        >
          Retirer
        </Button>
      ),
    },
  ];

  if (studentsLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Gestion des Parents" />

      <Card>
        <CardHeader>
          <CardTitle>Lier un parent à un élève</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLink} className="grid gap-4 md:grid-cols-4">
            <Select
              placeholder="Sélectionner un élève..."
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              options={(students || []).map((s: any) => ({ value: String(s.id), label: `${s.name} (${s.matricule || '#' + s.id})` }))}
            />
            <Select
              placeholder="Sélectionner un parent..."
              value={parentUserId}
              onChange={(e) => setParentUserId(e.target.value)}
              options={(users || []).map((u: any) => ({ value: String(u.id), label: `${u.name || u.email} (${u.role})` }))}
            />
            <Select
              placeholder="Relation (optionnel)"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              options={[
                { value: 'PÈRE', label: 'Père' },
                { value: 'MÈRE', label: 'Mère' },
                { value: 'TUTEUR', label: 'Tuteur' },
                { value: 'ONCLE', label: 'Oncle' },
                { value: 'TANTE', label: 'Tante' },
                { value: 'GRAND-PÈRE', label: 'Grand-père' },
                { value: 'GRAND-MÈRE', label: 'Grand-mère' },
              ]}
            />
            <Button type="submit" variant="primary" isLoading={linkMutation.isPending}>
              Lier
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parents d'un élève</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Select
              placeholder="Sélectionner un élève..."
              value={viewStudentId}
              onChange={(e) => setViewStudentId(e.target.value)}
              options={(students || []).map((s: any) => ({ value: String(s.id), label: `${s.name} (${s.matricule || '#' + s.id})` }))}
            />
          </div>
          {linksLoading ? (
            <LoadingState type="list" count={3} />
          ) : viewStudentId && parentLinks && parentLinks.length > 0 ? (
            <Table data={parentLinks} columns={columns} />
          ) : viewStudentId ? (
            <p className="text-text/50 text-center py-8">Aucun parent lié à cet élève.</p>
          ) : (
            <p className="text-text/50 text-center py-8">Sélectionnez un élève pour voir ses parents.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
