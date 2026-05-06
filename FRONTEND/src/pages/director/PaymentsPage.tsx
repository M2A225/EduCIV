import { Card } from '../../components/ui/Card';

const paymentsData = [
  { id: 1, student: 'Jean Dupont', amount: '25,000 FCFA', date: '05/05/2026', mode: 'Mobile Money' },
  { id: 2, student: 'Marie Keita', amount: '25,000 FCFA', date: '04/05/2026', mode: 'Espèces' },
];

export const PaymentsPage = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-800">Suivi des Paiements</h1>
    <Card>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="p-3">Élève</th>
            <th className="p-3">Montant</th>
            <th className="p-3">Date</th>
            <th className="p-3">Mode</th>
          </tr>
        </thead>
        <tbody>
          {paymentsData.map(p => (
            <tr key={p.id} className="border-b">
              <td className="p-3">{p.student}</td>
              <td className="p-3 font-bold text-green-700">{p.amount}</td>
              <td className="p-3">{p.date}</td>
              <td className="p-3">{p.mode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);
