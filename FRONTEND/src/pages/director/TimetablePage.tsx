import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const hours = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'];

export const TimetablePage = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Emploi du Temps</h1>
        <Button onClick={() => setShowForm(!showForm)}>+ Ajouter Séance</Button>
      </div>

      {showForm && (
        <Card className="bg-blue-50">
          <h2 className="font-bold mb-4">Nouvelle Séance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Classe" placeholder="Ex: 6ème A" />
            <Input label="Professeur" placeholder="Ex: M. Diallo" />
            <Input label="Matière" placeholder="Ex: Mathématiques" />
          </div>
          <Button className="mt-2">Enregistrer</Button>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-3 border">Horaire</th>
              {days.map(day => <th key={day} className="p-3 border">{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="p-3 font-bold border">{hour}</td>
                {days.map(day => (
                  <td key={`${day}-${hour}`} className="p-3 border h-16 hover:bg-gray-50 text-xs">
                    {/* Séance placeholder */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
