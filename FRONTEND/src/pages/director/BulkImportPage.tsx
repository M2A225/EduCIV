import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { bulkImportService } from '../../services/bulk-import';
import type { ImportResult } from '../../services/bulk-import';
import { Download, Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';

type ImportType = 'students' | 'teachers' | 'parents';

const TYPE_LABELS: Record<ImportType, string> = {
  students: 'Élèves',
  teachers: 'Enseignants',
  parents: 'Parents',
};

export const BulkImportPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<ImportType>('students');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleDownloadTemplate = () => {
    bulkImportService.downloadTemplate(selectedType);
    toast.success('Téléchargement du template...');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.name.endsWith('.xlsx')) {
      toast.error('Format invalide. Veuillez sélectionner un fichier .xlsx');
      return;
    }
    setSelectedFile(file);
    setResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      let res: ImportResult;
      if (selectedType === 'students') {
        res = await bulkImportService.importStudents(selectedFile);
      } else if (selectedType === 'teachers') {
        res = await bulkImportService.importTeachers(selectedFile);
      } else {
        res = await bulkImportService.importParents(selectedFile);
      }

      setResult(res);
      if (res.errors.length === 0) {
        toast.success(`${res.imported} ${TYPE_LABELS[selectedType].toLowerCase()} importé(s) avec succès`);
      } else {
        toast.warning(`${res.imported} importé(s), ${res.errors.length} erreur(s)`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erreur lors de l\'import');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Import en masse" subtitle="Importez plusieurs élèves, enseignants ou parents à partir d'un fichier Excel" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Télécharger un template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(TYPE_LABELS) as [ImportType, string][]).map(([type, label]) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedType(type);
                    setSelectedFile(null);
                    setResult(null);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            <p className="text-sm text-text/60">
              Type sélectionné : <strong>{TYPE_LABELS[selectedType]}</strong>
            </p>
            <Button variant="glass" onClick={handleDownloadTemplate} className="w-full">
              <Download className="w-4 h-4" />
              Télécharger le template {TYPE_LABELS[selectedType]}
            </Button>
          </CardContent>
        </Card>

        {/* Import section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Importer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition-colors bg-white/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto text-primary/50 mb-3" />
              <p className="text-sm text-text/80 font-medium">
                {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner un fichier .xlsx'}
              </p>
              <p className="text-xs text-text/40 mt-1">
                ou glissez-déposez votre fichier ici
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              isLoading={isImporting}
            >
              <Upload className="w-4 h-4" />
              Importer les {TYPE_LABELS[selectedType].toLowerCase()}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Résultat de l'import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">{result.imported}</span>
                <span>importé(s)</span>
              </div>
              {result.errors.length > 0 && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">{result.errors.length}</span>
                  <span>erreur(s)</span>
                </div>
              )}
              {result.invitations.length > 0 && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">{result.invitations.length}</span>
                  <span>invitation(s) générée(s)</span>
                </div>
              )}
            </div>

            {/* Errors table */}
            {result.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-text mb-2 text-sm">Erreurs</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-red-50 text-red-800">
                        <th className="text-left p-2 font-medium">Ligne</th>
                        <th className="text-left p-2 font-medium">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((err, idx) => (
                        <tr key={`err-${err.row}-${idx}`} className="border-t border-red-100">
                          <td className="p-2 text-red-600 font-mono">{err.row}</td>
                          <td className="p-2 text-red-700">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Invitations table */}
            {result.invitations.length > 0 && (
              <div>
                <h4 className="font-semibold text-text mb-2 text-sm">Invitations générées</h4>
                <p className="text-xs text-text/40 mb-3">
                  Copiez les liens ci-dessous et partagez-les avec les personnes concernées pour qu'elles finalisent leur inscription.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-50 text-blue-800">
                        <th className="text-left p-2 font-medium">Type</th>
                        <th className="text-left p-2 font-medium">Nom</th>
                        <th className="text-left p-2 font-medium">Lien d'invitation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.invitations.map((inv, idx) => (
                        <tr key={`inv-${inv.nom}-${idx}`} className="border-t border-blue-100">
                          <td className="p-2">{inv.type === 'TEACHER' ? 'Enseignant' : 'Parent'}</td>
                          <td className="p-2">{inv.nom}</td>
                          <td className="p-2">
                            <code className="text-xs bg-blue-50 px-2 py-1 rounded break-all">{inv.lien}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
