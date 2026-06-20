import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { usePaymentPlans } from '../../hooks/usePaymentPlans';
import { useCreatePaymentPlan, useDeletePaymentPlan } from '../../hooks/usePaymentPlans';
import { Plus, Pencil, Trash2, DollarSign } from 'lucide-react';

export const AccountantPaymentPlansPage = () => {
  const queryClient = useQueryClient();
  const { data: plans, isLoading, error, refetch } = usePaymentPlans();
  const createPlan = useCreatePaymentPlan();
  const deletePlan = useDeletePaymentPlan();

  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [form, setForm] = useState({ name: '', total_amount: '' });

  const openCreate = () => {
    setEditPlan(null);
    setForm({ name: '', total_amount: '' });
    setShowModal(true);
  };

  const openEdit = (plan: any) => {
    setEditPlan(plan);
    setForm({ name: plan.name, total_amount: String(plan.total_amount || '') });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    try {
      if (editPlan) {
        await queryClient.fetchQuery({
          queryKey: ['update-plan', editPlan.id],
          queryFn: () => import('../../services/api').then(({ api }) =>
            api.patch(`/payment-plans/${editPlan.id}`, {
              name: form.name,
              total_amount: form.total_amount ? Number(form.total_amount) : undefined,
            })
          ),
        });
        toast.success('Plan modifié');
      } else {
        await createPlan.mutateAsync({
          name: form.name,
          total_amount: form.total_amount ? Number(form.total_amount) : 0,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['payment-plans'] });
      setShowModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erreur');
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Supprimer ce plan de paiement ?')) {
      deletePlan.mutate(id);
    }
  };

  if (isLoading) return <LoadingState type="list" count={5} />;
  if (error) return <Feedback type="error" message="Erreur de chargement" onRetry={refetch} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Plans de paiement"
        subtitle="Gérer les plans de paiement"
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Nouveau plan
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(plans || []).map((plan: any) => (
          <Card key={plan.id} className="border border-primary/10 hover:border-primary/30 transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{plan.name}</h3>
                    {plan.total_amount && (
                      <p className="text-sm text-text/50">Total: {plan.total_amount.toLocaleString()} FCFA</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="glass" className="p-1.5" aria-label="Modifier" onClick={() => openEdit(plan)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="p-1.5 border-red-200 text-red-600" aria-label="Supprimer" isLoading={deletePlan.isPending} onClick={() => handleDelete(plan.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {plan.total_amount && (
                <p className="text-lg font-bold text-cta">{plan.total_amount.toLocaleString()} FCFA</p>
              )}
            </CardContent>
          </Card>
        ))}
        {(!plans || plans.length === 0) && (
          <div className="col-span-full text-center py-12 text-text/60">Aucun plan de paiement</div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editPlan ? 'Modifier le plan' : 'Nouveau plan de paiement'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom du plan *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Montant total (FCFA)"
            type="number"
            value={form.total_amount}
            onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
            placeholder="Optionnel"
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" isLoading={createPlan.isPending}>
              {editPlan ? 'Modifier' : 'Créer'}
            </Button>
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
