import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Mock data
const classesData = [
  { id: 1, name: '6ème A', capacity: 40, teacher: 'M. Diallo' },
  { id: 2, name: '6ème B', capacity: 35, teacher: 'Mme. Sow' },
];

export const ClassesPage = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">Gestion des Classes</h1>
      <Button>+ Créer Classe</Button>
    </div>
    <Card>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="p-3">Nom</th>
            <th className="p-3">Effectif</th>
            <th className="p-3">Prof. Principal</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {classesData.map(c => (
            <tr key={c.id} className="border-b">
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.capacity}</td>
              <td className="p-3">{c.teacher}</td>
              <td className="p-3"><Button variant="outline" className="text-xs">Voir</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);
