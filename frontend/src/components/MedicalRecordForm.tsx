import { Alert, Box, Button, Grid, TextField } from '@mui/material';
import { type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { MedicalRecordFormData } from '../services/medicalRecordService';

interface MedicalRecordFormProps {
  value: MedicalRecordFormData;
  onChange: (value: MedicalRecordFormData) => void;
  onSubmit: () => void;
  submitting: boolean;
  isEmpty: boolean;
}

const TEXT_FIELDS: (keyof MedicalRecordFormData)[] = [
  'preexistingConditions',
  'injuries',
  'surgeriesOrProsthetics',
  'physicalRestrictions',
  'medication',
  'allergies',
];

export function MedicalRecordForm({
  value,
  onChange,
  onSubmit,
  submitting,
  isEmpty,
}: MedicalRecordFormProps) {
  const { t } = useTranslation();

  const setField =
    (field: keyof MedicalRecordFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [field]: e.target.value });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      {isEmpty && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('medicalRecord.empty')}
        </Alert>
      )}
      <Grid container spacing={2}>
        {TEXT_FIELDS.map((field) => (
          <Grid item xs={12} sm={6} key={field}>
            <TextField
              label={t(`medicalRecord.fields.${field}`)}
              fullWidth
              multiline
              minRows={2}
              value={value[field] ?? ''}
              onChange={setField(field)}
            />
          </Grid>
        ))}
        <Grid item xs={12} sm={6}>
          <TextField
            label={t('medicalRecord.fields.bloodType')}
            fullWidth
            value={value.bloodType ?? ''}
            onChange={setField('bloodType')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={t('medicalRecord.fields.notes')}
            fullWidth
            multiline
            minRows={3}
            value={value.notes ?? ''}
            onChange={setField('notes')}
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" disabled={submitting}>
          {t('common.save')}
        </Button>
      </Box>
    </Box>
  );
}
