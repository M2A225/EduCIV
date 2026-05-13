import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const BackofficeDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Super Admin - EduCIV</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-bold mb-4">Gestion Administrative</h2>
          <div className="space-y-2">
            <Link to="/backoffice/schools"><Button variant="outline" className="w-full">Gérer les Écoles</Button></Link>
            <Link to="/backoffice/users"><Button variant="outline" className="w-full">Gérer les Utilisateurs</Button></Link>
          </div>
        </Card>
        <Card>
          <h2 className="font-bold mb-4">Système</h2>
          <div className="space-y-2">
            <Button variant="outline" className="w-full">Logs Système</Button>
            <Button variant="danger" className="w-full">Maintenance</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
