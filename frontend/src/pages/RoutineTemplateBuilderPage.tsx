import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { ExercisePickerDialog } from '../components/ExercisePickerDialog';
import type { Exercise } from '../services/exerciseService';
import {
  routineTemplateService,
  type RoutinePhase,
  type RoutineTemplateInput,
} from '../services/routineTemplateService';

interface EditEntry {
  exerciseId: number;
  exerciseName: string;
  phase: RoutinePhase;
  block: string;
  kg: string;
  reps: string;
  series: string;
  notes: string;
}

interface EditSession {
  name: string;
  warmupPrescription: string;
  entries: EditEntry[];
}

function emptySession(): EditSession {
  return { name: '', warmupPrescription: '', entries: [] };
}

function toNullableNumber(value: string): number | null {
  return value.trim() === '' ? null : Number(value);
}

export function RoutineTemplateBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [description, setDescription] = useState('');
  const [generalConsiderations, setGeneralConsiderations] = useState('');
  const [sessions, setSessions] = useState<EditSession[]>([emptySession()]);
  const [picker, setPicker] = useState<{ sessionIndex: number; phase: RoutinePhase } | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    routineTemplateService.get(Number(id)).then((tpl) => {
      setName(tpl.name);
      setObjective(tpl.objective ?? '');
      setDescription(tpl.description ?? '');
      setGeneralConsiderations(tpl.generalConsiderations ?? '');
      setSessions(
        tpl.sessions.map((s) => ({
          name: s.name,
          warmupPrescription: s.warmupPrescription ?? '',
          entries: s.entries.map((e) => ({
            exerciseId: e.exerciseId,
            exerciseName: e.exerciseName ?? '',
            phase: e.phase,
            block: e.block ?? '',
            kg: e.kg == null ? '' : String(e.kg),
            reps: e.reps == null ? '' : String(e.reps),
            series: e.series == null ? '' : String(e.series),
            notes: e.notes ?? '',
          })),
        })),
      );
    });
  }, [id]);

  const updateSession = (index: number, patch: Partial<EditSession>) =>
    setSessions((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const updateEntry = (sessionIndex: number, entryIndex: number, patch: Partial<EditEntry>) =>
    setSessions((prev) =>
      prev.map((s, i) =>
        i === sessionIndex
          ? { ...s, entries: s.entries.map((e, j) => (j === entryIndex ? { ...e, ...patch } : e)) }
          : s,
      ),
    );

  const removeEntry = (sessionIndex: number, entryIndex: number) =>
    setSessions((prev) =>
      prev.map((s, i) =>
        i === sessionIndex ? { ...s, entries: s.entries.filter((_, j) => j !== entryIndex) } : s,
      ),
    );

  const handleChoose = (exercise: Exercise) => {
    if (!picker) return;
    const { sessionIndex, phase } = picker;
    setSessions((prev) =>
      prev.map((s, i) =>
        i === sessionIndex
          ? {
              ...s,
              entries: [
                ...s.entries,
                {
                  exerciseId: exercise.id,
                  exerciseName: exercise.name,
                  phase,
                  block: '',
                  kg: '',
                  reps: '',
                  series: '',
                  notes: '',
                },
              ],
            }
          : s,
      ),
    );
    setPicker(null);
  };

  const buildPayload = (): RoutineTemplateInput => ({
    name,
    objective: objective || null,
    description: description || null,
    generalConsiderations: generalConsiderations || null,
    sessions: sessions.map((s, si) => ({
      name: s.name,
      warmupPrescription: s.warmupPrescription || null,
      order: si,
      entries: s.entries.map((e, ei) => ({
        exerciseId: e.exerciseId,
        phase: e.phase,
        block: e.block || null,
        kg: toNullableNumber(e.kg),
        reps: toNullableNumber(e.reps),
        series: toNullableNumber(e.series),
        notes: e.notes || null,
        order: ei,
      })),
    })),
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!name.trim()) {
      setError(t('routines.form.requiredName'));
      return;
    }
    if (sessions.length === 0 || sessions.some((s) => !s.name.trim())) {
      setError(t('routines.form.requiredSession'));
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await routineTemplateService.update(Number(id), payload);
      } else {
        await routineTemplateService.create(payload);
      }
      navigate('/routines');
    } catch {
      setError(t('routines.form.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const title = useMemo(
    () => (isEdit ? t('routines.form.editTitle') : t('routines.form.newTitle')),
    [isEdit, t],
  );

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <BackButton to="/routines" />
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Typography variant="h5" component="h1" gutterBottom>
          {title}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField label={t('routines.form.name')} fullWidth required value={name} onChange={(e) => setName(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('routines.form.objective')} fullWidth value={objective} onChange={(e) => setObjective(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField label={t('routines.form.description')} fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t('routines.form.generalConsiderations')}
              fullWidth
              multiline
              minRows={2}
              value={generalConsiderations}
              onChange={(e) => setGeneralConsiderations(e.target.value)}
            />
          </Grid>
        </Grid>

        {sessions.map((session, si) => (
          <Card key={si} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <TextField
                  label={t('routines.form.sessionName')}
                  required
                  value={session.name}
                  onChange={(e) => updateSession(si, { name: e.target.value })}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  color="error"
                  onClick={() => setSessions((prev) => prev.filter((_, i) => i !== si))}
                >
                  {t('routines.form.removeSession')}
                </Button>
              </Stack>
              <TextField
                label={t('routines.form.warmupPrescription')}
                fullWidth
                value={session.warmupPrescription}
                onChange={(e) => updateSession(si, { warmupPrescription: e.target.value })}
                sx={{ mb: 2 }}
              />

              {(['warmup', 'main'] as RoutinePhase[]).map((phase) => (
                <Box key={phase} sx={{ mb: 2 }}>
                  <Divider textAlign="left" sx={{ mb: 1 }}>
                    {phase === 'warmup' ? t('routines.form.warmupPhase') : t('routines.form.mainPhase')}
                  </Divider>
                  {session.entries.map((entry, ei) =>
                    entry.phase !== phase ? null : (
                      <Stack key={ei} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
                        <Typography sx={{ minWidth: 140 }}>{entry.exerciseName}</Typography>
                        {phase === 'main' && (
                          <TextField label={t('routines.form.block')} size="small" sx={{ width: 100 }} value={entry.block} onChange={(e) => updateEntry(si, ei, { block: e.target.value })} />
                        )}
                        <TextField label={t('routines.form.kg')} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 80 }} value={entry.kg} onChange={(e) => updateEntry(si, ei, { kg: e.target.value })} />
                        <TextField label={t('routines.form.reps')} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 80 }} value={entry.reps} onChange={(e) => updateEntry(si, ei, { reps: e.target.value })} />
                        <TextField label={t('routines.form.series')} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 80 }} value={entry.series} onChange={(e) => updateEntry(si, ei, { series: e.target.value })} />
                        <TextField label={t('routines.form.notes')} size="small" sx={{ flexGrow: 1, minWidth: 120 }} value={entry.notes} onChange={(e) => updateEntry(si, ei, { notes: e.target.value })} />
                        <IconButton aria-label={t('routines.form.removeExercise')} onClick={() => removeEntry(si, ei)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    ),
                  )}
                  <Button size="small" onClick={() => setPicker({ sessionIndex: si, phase })}>
                    {t('routines.form.addExercise')}
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}

        <Button sx={{ mb: 3 }} onClick={() => setSessions((prev) => [...prev, emptySession()])}>
          {t('routines.form.addSession')}
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={submitting}>
            {t('common.save')}
          </Button>
          <Button variant="text" onClick={() => navigate('/routines')}>
            {t('common.cancel')}
          </Button>
        </Box>
      </Box>

      <ExercisePickerDialog
        open={picker !== null}
        onCancel={() => setPicker(null)}
        onChoose={handleChoose}
      />
    </Box>
  );
}
