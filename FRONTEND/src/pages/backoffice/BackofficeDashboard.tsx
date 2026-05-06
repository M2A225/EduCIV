import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const BackofficeDashboard = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-800">Super Admin - EduCIV</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <p className="text-sm text-gray-500">Écoles Actives</p>
        <p className="text-2xl font-bold">12</p>
      </Card>
      <Card>
        <p className="text-sm text-gray-500">Utilisateurs Globaux</p>
        <p className="text-2xl font-bold">450</p>
      </Card>
      <Card>
        <p className="text-sm text-gray-500">Statut Système</p>
        <p className="text-2xl font-bold text-green-600">Opérationnel</p>
      </Card>
    </div>

    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">Gestion des Écoles</h2>
        <Button className="w-auto">+ Créer École</Button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="p-3">Nom</th>
            <th className="p-3">Statut</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-3">Collège Pierre le Grand</td>
            <td className="p-3 text-green-600">Actif</td>
            <td className="p-3 flex gap-2">
              <Button variant="outline" className="text-xs w-auto">Éditer</Button>
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  </div>
);
