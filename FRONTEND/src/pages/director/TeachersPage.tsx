import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Mock data
const teachersData = [
  { id: 1, name: 'M. Diallo', subject: 'Mathématiques', classes: '6ème A, 5ème B' },
  { id: 2, name: 'Mme. Sow', subject: 'Français', classes: '6ème B, 4ème A' },
];

export const TeachersPage = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">Gestion des Enseignants</h1>
      <Button>+ Ajouter</Button>
    </div>
    <Card>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="p-3">Nom</th>
            <th className="p-3">Matière</th>
            <th className="p-3">Classes</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachersData.map(t => (
            <tr key={t.id} className="border-b">
              <td className="p-3">{t.name}</td>
              <td className="p-3">{t.subject}</td>
              <td className="p-3">{t.classes}</td>
              <td className="p-3"><Button variant="outline" className="text-xs">Modifier</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);
