import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { CreditCard, DollarSign } from 'lucide-react';

export const AccountantSettingsPage = () => {
  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Paramètres comptables"
        subtitle="Gestion des outils financiers"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/accountant/settings/plans" className="group">
          <Card className="hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 cursor-pointer p-6 border border-primary/10">
            <CardContent className="p-0">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text">Plans de paiement</h3>
                <p className="text-sm text-text/50">Créer et gérer les plans de paiement</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/accountant/financial" className="group">
          <Card className="hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 cursor-pointer p-6 border border-primary/10">
            <CardContent className="p-0">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text">Clôture financière</h3>
                <p className="text-sm text-text/50">Finaliser l'exercice comptable</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};
