import { useNotes } from '../../hooks/useNotes';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';

export const ParentNotesPage = () => {
  const { grades, loading, error } = useNotes();

  if (loading) return <LoadingState />;
  if (error) return <Feedback type="error" message={error instanceof Error ? error.message : 'Une erreur est survenue'} />;

  return (
    <div>
      <PageHeader title="Notes de l'enfant" size="sm" />

      <div className="grid gap-4">
        {grades?.map((grade: any) => (
          <div key={grade.id} className="glass p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{grade.subject?.name || 'Matière'}</div>
                <div className="text-sm text-text/60">{grade.type}</div>
              </div>
              <div className="text-2xl font-bold text-primary">{grade.value}/20</div>
            </div>
          </div>
        ))}
        {grades?.length === 0 && (
          <div className="glass p-8 rounded-xl text-center text-text/60">
            Aucune note disponible
          </div>
        )}
      </div>
    </div>
  );
};
