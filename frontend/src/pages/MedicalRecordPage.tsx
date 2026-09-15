import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Snackbar, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { MedicalRecordForm } from '../components/MedicalRecordForm';
import { clientService, type Client } from '../services/clientService';
import {
  medicalRecordService,
  type MedicalRecordFormData,
} from '../services/medicalRecordService';

const EMPTY_FORM: MedicalRecordFormData = {
  preexistingConditions: '',
  injuries: '',
  surgeriesOrProsthetics: '',
  physicalRestrictions: '',
  medication: '',
  allergies: '',
  bloodType: '',
  notes: '',
};

export function MedicalRecordPage() {
  const { clientId } = useParams();
  const { t } = useTranslation();
  const [client, setClient] = useState<Client | null>(null);
  const [form, setForm] = useState<MedicalRecordFormData>(EMPTY_FORM);
  const [isEmpty, setIsEmpty] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    const id = Number(clientId);
    clientService
      .get(id)
      .then(setClient)
      .catch(() => setError(t('medicalRecord.loadFailed')));
    medicalRecordService
      .get(id)
      .then((record) => {
        if (record) {
          setForm({ ...EMPTY_FORM, ...stripNulls(record as unknown as Record<string, unknown>) });
          setIsEmpty(false);
        }
      })
      .catch(() => setError(t('medicalRecord.loadFailed')));
  }, [clientId, t]);

  const handleSubmit = async () => {
    if (!clientId) return;
    setError('');
    setSubmitting(true);
    try {
      await medicalRecordService.save(Number(clientId), form);
      setIsEmpty(false);
      setSaved(true);
    } catch {
      setError(t('medicalRecord.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const clientName = client ? `${client.firstName} ${client.lastName}` : '';

  return (
    <div>
      <BackButton to="/clients" />
      <Typography variant="h4" gutterBottom>
        {t('medicalRecord.title')}
      </Typography>
      {clientName && (
        <Typography color="text.secondary" gutterBottom>
          {t('medicalRecord.subtitle', { name: clientName })}
        </Typography>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <MedicalRecordForm
        value={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        isEmpty={isEmpty}
      />
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        message={t('medicalRecord.saved')}
      />
    </div>
  );
}

function stripNulls(record: Record<string, unknown>): MedicalRecordFormData {
  const result: Record<string, string> = {};
  for (const key of Object.keys(EMPTY_FORM) as (keyof MedicalRecordFormData)[]) {
    const value = record[key];
    result[key] = typeof value === 'string' ? value : '';
  }
  return result;
}
