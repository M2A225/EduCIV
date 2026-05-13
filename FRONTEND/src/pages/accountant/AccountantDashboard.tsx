import { Card } from '../../components/ui/Card';

export const AccountantDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord Comptable</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>Gestion des paiements</Card>
        <Card>États financiers</Card>
        <Card>Rapports</Card>
      </div>
    </div>
  );
};
