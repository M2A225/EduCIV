import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

export const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="space-y-6">
    <PageHeader title={title} size="sm" />
    <Card>
      <p className="text-gray-500">Interface de {title} en cours de configuration...</p>
    </Card>
  </div>
);
