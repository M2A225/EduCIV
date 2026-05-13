import { Card } from '../../components/ui/Card';

export const ProfessorDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord Professeur</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>Gestion des cours</Card>
        <Card>Saisie des notes</Card>
        <Card>Suivi des présences</Card>
      </div>
    </div>
  );
};
