import { Card } from '../../components/ui/Card';

export const StudentDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord Étudiant</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>Emploi du temps</Card>
        <Card>Mes notes</Card>
        <Card>Mes paiements</Card>
      </div>
    </div>
  );
};
