import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PageHeader } from '../../components/ui/PageHeader';
import { api } from '../../services/api';
import { ArrowLeft, BookOpen, Upload, Archive, BarChart3, CreditCard, CalendarPlus, GraduationCap } from 'lucide-react';

export const SchoolSettingsPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '', address: '', phone: '', email: '', city: '', type: '', logo_url: '',
    school_type: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await api.get('/schools/me');
        const school = (res.data as any)?.data;
        if (school) {
          setFormData({
            name: school.name || '',
            address: school.address || '',
            phone: school.phone || '',
            email: school.email || '',
            city: school.city || '',
            type: school.type || '',
            logo_url: school.logo_url || '',
            school_type: school.school_type || '',
          });
        }
      } catch (err) {
        toast.error('Impossible de charger les informations de l\'école');
      }
    };
    fetchSchool();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/schools/me', formData);
      setIsEditing(false);
      toast.success('Informations mises à jour avec succès');
    } catch (err) {
      toast.error('Échec de la sauvegarde des informations');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 2 MB');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/schools/logo', formData);
      const school = (res.data as any)?.data;
      if (school?.logo_url) {
        setFormData(prev => ({ ...prev, logo_url: school.logo_url }));
        setPreviewUrl(null);
        URL.revokeObjectURL(localUrl);
        toast.success('Logo mis à jour avec succès');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Erreur inconnue';
      toast.error(`Échec de l'upload : ${msg}`);
      URL.revokeObjectURL(localUrl);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Paramètres de l'école"
        actions={
          !isEditing ? <Button variant="primary" onClick={() => setIsEditing(true)}>Modifier</Button> :
          <Button variant="glass" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Link to="/settings/subjects" className="group">
          <Card className="hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 cursor-pointer p-5 h-full border border-primary/10">
            <CardContent className="p-0">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-text">Matières</h3>
                <p className="text-xs text-text/50">Gérer les matières enseignées</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/settings/filieres" className="group">
          <Card className="hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 cursor-pointer p-5 h-full border border-primary/10">
            <CardContent className="p-0">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-text">Filières</h3>
                <p className="text-xs text-text/50">Configurer les filières et séries</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/settings/import" className="group">
          <Card className="hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 cursor-pointer p-5 h-full border border-primary/10">
            <CardContent className="p-0">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-text">Import Excel</h3>
                <p className="text-xs text-text/50">Importer des données en masse</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/settings/archive" className="group">
          <Card className="hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 cursor-pointer p-5 h-full border border-primary/10">
            <CardContent className="p-0">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Archive className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-text">Archivage</h3>
                <p className="text-xs text-text/50">Archiver les données de l'année</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/settings/financial" className="group">
          <Card className="hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 cursor-pointer p-5 h-full border border-primary/10">
            <CardContent className="p-0">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-text">Clôture financière</h3>
                <p className="text-xs text-text/50">Finaliser l'exercice comptable</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/settings/next-year" className="group">
          <Card className="hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 cursor-pointer p-5 h-full border border-primary/10">
            <CardContent className="p-0">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <CalendarPlus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-text">Nouvelle année</h3>
                <p className="text-xs text-text/50">Préparer la rentrée suivante</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/settings/statistics" className="group">
          <Card className="hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 cursor-pointer p-5 h-full border border-primary/10">
            <CardContent className="p-0">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-text">Statistiques</h3>
                <p className="text-xs text-text/50">Vue d'ensemble chiffrée</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="border border-primary/5">
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Nom de l'école"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              label="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              label="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              label="Ville"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              disabled={!isEditing}
            />
            <Select
              label="Type d'établissement"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              disabled={!isEditing}
              options={[
                { value: 'PUBLIC', label: 'Public' },
                { value: 'PRIVE', label: 'Privé' },
                { value: 'CONFESSIONNEL', label: 'Confessionnel' },
                { value: 'LAIC', label: 'Laïc' },
              ]}
              placeholder="Sélectionner..."
            />
            <Select
              label="Type d'école"
              value={formData.school_type}
              onChange={(e) => setFormData({ ...formData, school_type: e.target.value })}
              disabled={!isEditing}
              options={[
                { value: '', label: 'Non défini' },
                { value: 'PRIMAIRE', label: 'Primaire' },
                { value: 'SECONDAIRE', label: 'Secondaire (Collège + Lycée général)' },
                { value: 'LYCEE_TECHNIQUE', label: 'Lycée Technique' },
                { value: 'LYCEE_PROFESSIONNEL', label: 'Lycée Professionnel' },
                { value: 'GROUPE_SCOLAIRE', label: 'Groupe scolaire' },
              ]}
            />

          </div>
          {isEditing && (
            <div className="flex gap-4 mt-6">
              <Button variant="primary" onClick={handleSave} isLoading={loading}>
                Sauvegarder
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-primary/5">
        <CardHeader>
          <CardTitle>Logo de l'école</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center overflow-hidden">
              {previewUrl || formData.logo_url ? (
                <img src={previewUrl || formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {formData.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploading}
              >
                {formData.logo_url ? 'Changer le logo' : 'Ajouter un logo'}
              </Button>
              <p className="text-xs text-text/40 mt-2">PNG, JPG max 2MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};