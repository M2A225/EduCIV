import type { Student } from '../../types';
import { Card } from '../ui/Card';

interface ViewStudentModalProps {
  student: Student;
  onClose: () => void;
}

export const ViewStudentModal = ({ student, onClose }: ViewStudentModalProps) => (
  <div className="fixed inset-0 bg-text/20 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
    <Card className="w-full max-w-lg p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <h2 className="text-2xl font-heading font-bold mb-6 text-text">Détails de l'élève</h2>
      <div className="space-y-3 text-sm">
        <Row label="Nom" value={student.name} />
        <Row label="Matricule" value={student.matricule} />
        <Row label="Sexe" value={student.sexe === 'M' ? 'Masculin' : student.sexe === 'F' ? 'Féminin' : '-'} />
        <Row label="Date naissance" value={student.dob ? new Date(student.dob).toLocaleDateString('fr-FR') : '-'} />
        <Row label="Lieu naissance" value={student.place_birth || '-'} />
        <Row label="Nationalité" value={student.nationality || '-'} />
        <Row label="Régime" value={student.regime ? { INTERNE: 'Interne', EXTERNE: 'Externe', DEMI_PENSION: 'Demi-pension' }[student.regime] || student.regime : '-'} />
        <Row label="Redoublant" value={student.is_repeater ? 'Oui' : 'Non'} />
        <Row label="Actif" value={student.is_affected ? 'Oui' : 'Non'} />
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-primary/10 hover:bg-primary/5 transition-colors">Fermer</button>
      </div>
    </Card>
  </div>
);

const Row = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="flex justify-between border-b border-primary/5 pb-2">
    <span className="font-semibold text-text/60">{label}</span>
    <span className="text-text">{value}</span>
  </div>
);
