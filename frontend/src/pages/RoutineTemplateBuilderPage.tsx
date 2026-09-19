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

interface EditWeek {
  week: number;
  kg: string;
  reps: string;
  series: string;
}

interface EditEntry {
  exerciseId: number;
  exerciseName: string;
  phase: RoutinePhase;
  block: string;
  kg: string;
  reps: string;
  series: string;
  notes: string;
  weeks: EditWeek[];
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
            weeks: (e.weeks ?? []).map((w) => ({
              week: w.week,
              kg: w.kg == null ? '' : String(w.kg),
              reps: w.reps == null ? '' : String(w.reps),
              series: w.series == null ? '' : String(w.series),
            })),
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

  const patchEntryWeeks = (sessionIndex: number, entryIndex: number, weeks: EditWeek[]) =>
    updateEntry(sessionIndex, entryIndex, { weeks });

  const addWeek = (sessionIndex: number, entryIndex: number, entry: EditEntry) => {
    const nextWeek = entry.weeks.length > 0 ? Math.max(...entry.weeks.map((w) => w.week)) + 1 : 1;
    patchEntryWeeks(sessionIndex, entryIndex, [...entry.weeks, { week: nextWeek, kg: '', reps: '', series: '' }]);
  };

  const updateWeek = (sessionIndex: number, entryIndex: number, entry: EditEntry, weekIndex: number, patch: Partial<EditWeek>) =>
    patchEntryWeeks(sessionIndex, entryIndex, entry.weeks.map((w, i) => (i === weekIndex ? { ...w, ...patch } : w)));

  const removeWeek = (sessionIndex: number, entryIndex: number, entry: EditEntry, weekIndex: number) =>
    patchEntryWeeks(sessionIndex, entryIndex, entry.weeks.filter((_, i) => i !== weekIndex));

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
                  weeks: [],
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
        // Drop fully-empty week rows; keep those with any value.
        weeks: e.weeks
          .filter((w) => w.kg.trim() !== '' || w.reps.trim() !== '' || w.series.trim() !== '')
          .map((w) => ({
            week: w.week,
            kg: toNullableNumber(w.kg),
            reps: toNullableNumber(w.reps),
            series: toNullableNumber(w.series),
          })),
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
                      <Box key={ei} sx={{ mb: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
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
                        <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider', ml: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {t('routines.form.weeklyProgression')}
                          </Typography>
                          {entry.weeks.map((week, wi) => (
                            <Stack key={wi} direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }} flexWrap="wrap">
                              <Typography variant="body2" sx={{ minWidth: 70 }}>
                                {t('routines.form.week')} {week.week}
                              </Typography>
                              <TextField label={t('routines.form.kg')} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 80 }} value={week.kg} onChange={(e) => updateWeek(si, ei, entry, wi, { kg: e.target.value })} />
                              <TextField label={t('routines.form.reps')} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 80 }} value={week.reps} onChange={(e) => updateWeek(si, ei, entry, wi, { reps: e.target.value })} />
                              <TextField label={t('routines.form.series')} size="small" type="number" inputProps={{ min: 0 }} sx={{ width: 80 }} value={week.series} onChange={(e) => updateWeek(si, ei, entry, wi, { series: e.target.value })} />
                              <IconButton size="small" aria-label={t('routines.form.removeWeek')} onClick={() => removeWeek(si, ei, entry, wi)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          ))}
                          <Button size="small" onClick={() => addWeek(si, ei, entry)}>
                            {t('routines.form.addWeek')}
                          </Button>
                        </Box>
                      </Box>
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
