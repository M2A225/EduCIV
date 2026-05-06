import { Card } from '../../components/ui/Card';

export const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <Card>
      <p className="text-gray-500">Interface de {title} en cours de configuration...</p>
    </Card>
  </div>
);
