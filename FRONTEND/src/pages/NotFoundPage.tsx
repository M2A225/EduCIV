import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FileQuestion } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg p-4 font-sans text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 animate-bounce">
        <FileQuestion className="text-primary w-12 h-12" />
      </div>
      
      <h1 className="text-6xl font-heading font-black text-primary mb-4">404</h1>
      <h2 className="text-2xl font-heading font-bold text-text mb-2">Page introuvable</h2>
      <p className="text-text/60 max-w-md mb-10 leading-relaxed">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
        Vérifiez l'URL ou revenez au tableau de bord.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none justify-center">
        <Button onClick={() => navigate(-1)} variant="outline" className="px-8">
          Retour
        </Button>
        <Button onClick={() => navigate('/')} variant="primary" className="px-8">
          Tableau de bord
        </Button>
      </div>
    </div>
  );
};
