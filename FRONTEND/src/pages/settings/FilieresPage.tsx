import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { api } from '../../services/api';
import { Save } from 'lucide-react';
import { LoadingState } from '../../components/ui/LoadingState';

const FILIERE_CATEGORIES: Record<string, { label: string; filieres: string[] }> = {
  PRIMAIRE: { label: 'Primaire', filieres: [] },
  SECONDAIRE: { label: 'Secondaire (Collège + Lycée général)', filieres: ['A1', 'A2', 'C', 'D'] },
  LYCEE_TECHNIQUE: { label: 'Lycée Technique', filieres: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'STIDD', 'STEG', 'T1', 'T2', 'G1', 'G2', 'G3'] },
  LYCEE_PROFESSIONNEL: { label: 'Lycée Professionnel', filieres: ['Comptabilité', 'Hôtellerie', 'BTP', 'Mécanique', 'Électricité', 'Électronique', 'Agro', 'Élevage', 'Agroalimentaire', 'Froid', 'Énergies Renouvelables', 'Mode', 'Coiffure', 'Esthétique', 'SanitaireSocial', 'TransportLogistique', 'Graphisme'] },
  GROUPE_SCOLAIRE: { label: 'Groupe scolaire', filieres: ['A1', 'A2', 'C', 'D', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'STIDD', 'STEG', 'T1', 'T2', 'G1', 'G2', 'G3', 'Comptabilité', 'Hôtellerie', 'BTP', 'Mécanique', 'Électricité', 'Électronique', 'Agro', 'Élevage', 'Agroalimentaire', 'Froid', 'Énergies Renouvelables', 'Mode', 'Coiffure', 'Esthétique', 'SanitaireSocial', 'TransportLogistique', 'Graphisme'] },
};

const FILIERES_BY_TYPE: Record<string, string[]> = {};
for (const key of Object.keys(FILIERE_CATEGORIES)) {
  FILIERES_BY_TYPE[key] = FILIERE_CATEGORIES[key].filieres;
}

// For GROUPE_SCOLAIRE: union of all filieres from all categories
const GROUPE_SCOLAIRE_FILIERES: Record<string, string[]> = {};
for (const [key, cat] of Object.entries(FILIERE_CATEGORIES)) {
  if (cat.filieres.length > 0) {
    GROUPE_SCOLAIRE_FILIERES[key] = cat.filieres;
  }
}

export const FilieresPage = () => {
  const [schoolType, setSchoolType] = useState<string>('');
  const [enabledFilieres, setEnabledFilieres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [schoolRes, filieresRes] = await Promise.all([
          api.get('/schools/me'),
          api.get('/schools/filieres'),
        ]);
        const school = schoolRes.data.data;
        setSchoolType(school.school_type || '');
        const currentFilieres: string[] = filieresRes.data.data?.map((f: any) => f.filiere) || [];
        setEnabledFilieres(currentFilieres);
      } catch {
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleToggle = (filiere: string) => {
    setEnabledFilieres(prev =>
      prev.includes(filiere) ? prev.filter(f => f !== filiere) : [...prev, filiere]
    );
  };

  const handleToggleCategory = (catFilieres: string[], enabled: boolean) => {
    if (enabled) {
      // Remove all filieres of this category
      setEnabledFilieres(prev => prev.filter(f => !catFilieres.includes(f)));
    } else {
      // Add all filieres of this category that aren't already enabled
      setEnabledFilieres(prev => [...new Set([...prev, ...catFilieres])]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/schools/filieres', { filieres: enabledFilieres });
      toast.success('Filières mises à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingState />
      </div>
    );
  }

  const availableFilieres = FILIERES_BY_TYPE[schoolType];

  if (schoolType === 'PRIMAIRE') {
    return (
      <div className="space-y-8 font-sans">
        <PageHeader title="Configuration des filières" subtitle="Primaire" />
        <Card>
          <CardContent className="py-8 text-center text-text/40">
            Les écoles primaires n'ont pas de filières (progression linéaire CP→CM2)
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Configuration des filières"
        subtitle={
          schoolType === 'GROUPE_SCOLAIRE'
            ? 'Sélectionnez les catégories et filières enseignées dans votre groupe scolaire'
            : `Type d'école : ${schoolType}`
        }
        actions={
          <Button onClick={handleSave} isLoading={saving}>
            <Save className="w-4 h-4" />
            Enregistrer
          </Button>
        }
      />

      {schoolType === 'GROUPE_SCOLAIRE' ? (
        <div className="space-y-6">
          {Object.entries(GROUPE_SCOLAIRE_FILIERES).map(([catKey, catFilieres]) => {
            const cat = FILIERE_CATEGORIES[catKey];
            const allEnabled = catFilieres.every(f => enabledFilieres.includes(f));

            return (
              <Card key={catKey}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{cat.label}</CardTitle>
                    <Button
                      variant={allEnabled ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleCategory(catFilieres, allEnabled)}
                    >
                      {allEnabled ? 'Tout retirer' : 'Tout sélectionner'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {catFilieres.map(filiere => (
                      <label
                        key={filiere}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          enabledFilieres.includes(filiere)
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={enabledFilieres.includes(filiere)}
                          onChange={() => handleToggle(filiere)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm font-medium text-text">{filiere}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : availableFilieres ? (
        <Card>
          <CardHeader>
            <CardTitle>Filières disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableFilieres.map(filiere => (
                <label
                  key={filiere}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    enabledFilieres.includes(filiere)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enabledFilieres.includes(filiere)}
                    onChange={() => handleToggle(filiere)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm font-medium text-text">{filiere}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-text/40">
            Type d'école non reconnu
          </CardContent>
        </Card>
      )}
    </div>
  );
};
