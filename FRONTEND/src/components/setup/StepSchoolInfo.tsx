import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { cityService } from '../../services/cities';
import { schoolService } from '../../services/schools';
import { SCHOOL_TYPE_LABELS } from '../../lib/constants';
import type { School, City } from '../../types';

const TYPES = [
  { value: 'Public', label: 'Public' },
  { value: 'Privé', label: 'Privé' },
  { value: 'Confessionnel', label: 'Confessionnel' },
  { value: 'Laïc', label: 'Laïc' },
];

interface Props {
  onComplete: () => void;
}

export const StepSchoolInfo = ({ onComplete }: Props) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city_id: '', commune_id: '', type: '', school_type: '' });
  const [cities, setCities] = useState<City[]>([]);
  const [communes, setCommunes] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cityService.getAll().then(res => setCities(res.data.data));
  }, []);

  useEffect(() => {
    if (form.city_id) {
      cityService.getCommunes(Number(form.city_id)).then(res => setCommunes(res.data.data));
    } else {
      setCommunes([]);
    }
  }, [form.city_id]);

  const selectedCity = cities.find(c => c.id === Number(form.city_id));

  const handleSave = async () => {
    setSaving(true);
    try {
      await schoolService.updateMySchool({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        city: selectedCity?.name || '',
        type: form.type || undefined,
        school_type: form.school_type || undefined,
      });
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const isValid = form.name && form.city_id && form.school_type;

  return (
    <div className="space-y-6">
      <Input label="Nom de l'école" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Ville" value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value, commune_id: '' }))}
          options={cities.map(c => ({ value: String(c.id), label: c.name }))} placeholder="Sélectionner..." />
        {communes.length > 0 && (
          <Select label="Commune" value={form.commune_id} onChange={e => setForm(f => ({ ...f, commune_id: e.target.value }))}
            options={communes.map(c => ({ value: String(c.id), label: c.name }))} placeholder="Facultatif" />
        )}
      </div>
      <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      <Input label="Téléphone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      <Input label="Adresse" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Type d'établissement" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          options={TYPES} placeholder="Sélectionner..." />
        <Select label="Type d'école" value={form.school_type} onChange={e => setForm(f => ({ ...f, school_type: e.target.value }))}
          options={Object.entries(SCHOOL_TYPE_LABELS).map(([value, label]) => ({ value, label }))} placeholder="Sélectionner..." />
      </div>
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={!isValid || saving}>
          {saving ? 'Enregistrement...' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
};
