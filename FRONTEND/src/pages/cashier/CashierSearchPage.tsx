import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useStudents } from '../../hooks/useStudents';
import { usePayments, useCreatePayment } from '../../hooks/usePayments';
import { usePaymentPlans } from '../../hooks/usePaymentPlans';
import type { CreatePaymentInput } from '../../services/payments';
import type { Student, Payment, PaymentPlan, PaymentType } from '../../types';

export const CashierSearchPage = () => {
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { payments } = usePayments();
  const { data: plans } = usePaymentPlans();
  const createPayment = useCreatePayment();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatePaymentInput & { plan_id?: number }>>({
    payment_type: 'SCOLARITE',
    payment_date: new Date().toISOString().split('T')[0],
  });

  const filteredStudents = useMemo(() => {
    if (!students || !search) return [];
    return students.filter((s: Student) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matricule?.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const studentPayments = useMemo(() => {
    if (!selectedStudent || !payments) return [];
    return payments.filter((p: Payment) => p.student_id === selectedStudent.id);
  }, [selectedStudent, payments]);

  const totalPaid = studentPayments
    .filter((p: Payment) => p.status === 'VALIDE')
    .reduce((sum: number, p: Payment) => sum + p.amount_fcfa, 0);

  const selectedPlan = useMemo(() => {
    if (!formData.plan_id || !plans) return null;
    return plans.find((p: PaymentPlan) => p.id === formData.plan_id);
  }, [formData.plan_id, plans]);

  const remainingBalance = useMemo(() => {
    if (!selectedPlan) return undefined;
    return Math.max(0, selectedPlan.total_amount - totalPaid);
  }, [selectedPlan, totalPaid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount_fcfa || !formData.receipt_number || !selectedStudent) return;

    try {
      await createPayment.mutateAsync({
        ...formData,
        student_id: selectedStudent.id,
      } as CreatePaymentInput);
      setShowPaymentModal(false);
      setFormData({ payment_type: 'SCOLARITE', payment_date: new Date().toISOString().split('T')[0], receipt_number: '', amount_fcfa: undefined });
    } catch { toast.error('Impossible d\'enregistrer le paiement'); }
  };

  if (studentsLoading) return <LoadingState />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Encaissement" />

      <Card>
        <CardHeader>
          <CardTitle>Rechercher un élève</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setSelectedStudent(null); }}
            placeholder="Rechercher par nom ou matricule..."
          />

          {search && !selectedStudent && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s: Student) => (
                  <div
                    key={s.id}
                    className="p-3 bg-white/50 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => { setSelectedStudent(s); setSearch(''); }}
                  >
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-text/60">
                      {s.matricule || 'Pas de matricule'} - {s.class_id ? `Classe #${s.class_id}` : 'Non assigné'}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text/60 text-center py-4">Aucun élève trouvé</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <>
          <Card className="border border-primary/5">
            <CardHeader>
              <CardTitle>Fiche élève</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-text/60">Nom</div>
                  <div className="font-semibold">{selectedStudent.name}</div>
                </div>
                <div>
                  <div className="text-sm text-text/60">Matricule</div>
                  <div className="font-semibold">{selectedStudent.matricule || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-text/60">Classe</div>
                  <div className="font-semibold">{selectedStudent.class_id ? `#${selectedStudent.class_id}` : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-text/60">Total payé</div>
                  <div className="font-semibold text-green-600">{totalPaid.toLocaleString()} FCFA</div>
                </div>
              </div>
              {remainingBalance !== undefined && (
                <div className="mt-2 text-sm">
                  <span className="text-text/60">Reste à payer: </span>
                  <span className="font-semibold text-cta">{remainingBalance.toLocaleString()} FCFA</span>
                </div>
              )}
              <Button variant="primary" className="mt-4" onClick={() => setShowPaymentModal(true)}>
                Encaisser un paiement
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
            </CardHeader>
            <CardContent>
              {studentPayments.length > 0 ? (
                <div className="space-y-2">
                  {studentPayments.map((p: Payment) => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                      <div>
                        <div className="font-medium">{p.payment_type}</div>
                        <div className="text-sm text-text/60">{new Date(p.payment_date).toLocaleDateString('fr-FR')} - Reçu: {p.receipt_number}</div>
                        {p.plan && <div className="text-xs text-text/40">{p.plan.name}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-cta">{p.amount_fcfa?.toLocaleString()} FCFA</div>
                        <div className={`text-xs ${p.status === 'VALIDE' ? 'text-green-600' : 'text-red-600'}`}>
                          {p.status === 'VALIDE' ? 'Validé' : 'Annulé'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text/60 text-center py-4">Aucun paiement enregistré</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Encaissement - {selectedStudent?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro de reçu</label>
                  <Input
                    value={formData.receipt_number || ''}
                    onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Montant (FCFA)</label>
                  <Input
                    type="number"
                    value={formData.amount_fcfa || ''}
                    onChange={(e) => setFormData({ ...formData, amount_fcfa: Number(e.target.value) })}
                    required
                  />
                  {remainingBalance !== undefined && (
                    <p className="text-xs text-text/60 mt-1">Reste à payer: {remainingBalance.toLocaleString()} FCFA</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type de paiement</label>
                  <select
                    className="input w-full"
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as PaymentType })}
                  >
                    <option value="SCOLARITE">Scolarité</option>
                    <option value="CANTINE">Cantine</option>
                    <option value="INSCRIPTION">Inscription</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Plan de paiement (optionnel)</label>
                  <select
                    className="input w-full"
                    value={formData.plan_id || ''}
                    onChange={(e) => setFormData({ ...formData, plan_id: e.target.value ? Number(e.target.value) : undefined })}
                  >
                    <option value="">Aucun plan</option>
                    {plans?.map((p: PaymentPlan) => (
                      <option key={p.id} value={p.id}>{p.name} - {p.total_amount.toLocaleString()} FCFA</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <Input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <Button type="submit" variant="primary" isLoading={createPayment.isPending} className="flex-1">
                    Confirmer
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
