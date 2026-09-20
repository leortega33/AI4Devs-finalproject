import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { exerciseService, type ExerciseFormData } from '../services/exerciseService';
import { REGION_CODES, type RegionCode } from '../constants/bodyRegions';
import { BackButton } from '../components/BackButton';

const EMPTY_FORM: ExerciseFormData = {
  name: '',
  muscleGroup: '',
  category: 'main',
  defaultSets: null,
  defaultReps: null,
  technique: '',
  equipment: '',
  videoUrl: '',
  imageUrl: '',
  bodyRegions: [],
};

export function ExerciseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<ExerciseFormData>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    exerciseService.get(Number(id)).then((e) => {
      setForm({
        name: e.name,
        muscleGroup: e.muscleGroup,
        category: e.category,
        defaultSets: e.defaultSets ?? null,
        defaultReps: e.defaultReps ?? null,
        technique: e.technique ?? '',
        equipment: e.equipment ?? '',
        videoUrl: e.videoUrl ?? '',
        imageUrl: e.imageUrl ?? '',
        bodyRegions: e.bodyRegions ?? [],
      });
    });
  }, [id]);

  const setField =
    (field: keyof ExerciseFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setRegions = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as unknown as RegionCode[];
    setForm((prev) => ({ ...prev, bodyRegions: value }));
  };

  const setNumber =
    (field: 'defaultSets' | 'defaultReps') => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value === '' ? null : Number(e.target.value) }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.name || !form.muscleGroup || !form.category) {
      setError(t('exercises.form.requiredFields'));
      return;
    }
    if ((form.defaultSets ?? 0) < 0 || (form.defaultReps ?? 0) < 0) {
      setError(t('exercises.form.negativeNumbers'));
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        await exerciseService.update(Number(id), form);
      } else {
        await exerciseService.create(form);
      }
      navigate('/exercises');
    } catch {
      setError(t('exercises.form.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <BackButton to="/exercises" />
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isEdit ? t('exercises.form.editTitle') : t('exercises.form.newTitle')}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label={t('exercises.form.name')} fullWidth required value={form.name} onChange={setField('name')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('exercises.form.muscleGroup')} fullWidth required value={form.muscleGroup} onChange={setField('muscleGroup')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('exercises.form.category')} fullWidth required select value={form.category} onChange={setField('category')}>
              <MenuItem value="mobility">{t('exercises.categoryMobility')}</MenuItem>
              <MenuItem value="activation">{t('exercises.categoryActivation')}</MenuItem>
              <MenuItem value="main">{t('exercises.categoryMain')}</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField label={t('exercises.form.defaultSets')} type="number" fullWidth inputProps={{ min: 0 }} value={form.defaultSets ?? ''} onChange={setNumber('defaultSets')} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField label={t('exercises.form.defaultReps')} type="number" fullWidth inputProps={{ min: 0 }} value={form.defaultReps ?? ''} onChange={setNumber('defaultReps')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label={t('exercises.form.equipment')} fullWidth value={form.equipment ?? ''} onChange={setField('equipment')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('exercises.form.videoUrl')} type="url" fullWidth placeholder="https://" value={form.videoUrl ?? ''} onChange={setField('videoUrl')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('exercises.form.imageUrl')} type="url" fullWidth placeholder="https://" value={form.imageUrl ?? ''} onChange={setField('imageUrl')} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t('exercises.form.bodyRegions')}
              fullWidth
              select
              value={form.bodyRegions ?? []}
              onChange={setRegions}
              SelectProps={{
                multiple: true,
                renderValue: (selected) => (
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as RegionCode[]).map((code) => (
                      <Chip key={code} size="small" label={t(`exercises.regions.${code}`)} />
                    ))}
                  </Stack>
                ),
              }}
              helperText={t('exercises.form.bodyRegionsHelp')}
            >
              {REGION_CODES.map((code) => (
                <MenuItem key={code} value={code}>
                  {t(`exercises.regions.${code}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label={t('exercises.form.technique')} fullWidth multiline minRows={3} value={form.technique ?? ''} onChange={setField('technique')} />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={submitting}>
            {t('common.save')}
          </Button>
          <Button variant="text" onClick={() => navigate('/exercises')}>
            {t('common.cancel')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
