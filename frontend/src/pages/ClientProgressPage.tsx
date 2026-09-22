import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { clientService, type Client } from '../services/clientService';
import {
  progressService,
  type ProgressEntry,
  type ProgressSummary,
  type RecordProgressData,
} from '../services/progressService';

const EMPTY_SUMMARY: ProgressSummary = { latestWeightKg: null, weightChangeKg: null, entryCount: 0 };

// The fixed metric set (US-026); order drives the form and the table columns.
const METRICS = [
  { key: 'weightKg', unit: 'kg' },
  { key: 'bodyFatPercent', unit: '%' },
  { key: 'chestCm', unit: 'cm' },
  { key: 'waistCm', unit: 'cm' },
  { key: 'hipsCm', unit: 'cm' },
  { key: 'armCm', unit: 'cm' },
  { key: 'thighCm', unit: 'cm' },
] as const;

type MetricKey = (typeof METRICS)[number]['key'];

function todayInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 140 }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  );
}

export function ClientProgressPage() {
  const { clientId } = useParams();
  const { t, i18n } = useTranslation();
  const [client, setClient] = useState<Client | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [summary, setSummary] = useState<ProgressSummary>(EMPTY_SUMMARY);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [date, setDate] = useState(todayInput());
  const [metrics, setMetrics] = useState<Record<MetricKey, string>>({
    weightKg: '',
    bodyFatPercent: '',
    chestCm: '',
    waistCm: '',
    hipsCm: '',
    armCm: '',
    thighCm: '',
  });
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState<ProgressEntry | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<{ entryId: number; photoId: number } | null>(null);

  const load = useCallback(async () => {
    if (!clientId) return;
    try {
      const data = await progressService.list(Number(clientId));
      setEntries(data.entries);
      setSummary(data.summary);
    } catch {
      setError(t('progress.loadFailed'));
    }
  }, [clientId, t]);

  useEffect(() => {
    if (!clientId) return;
    clientService.get(Number(clientId)).then(setClient).catch(() => undefined);
    load();
  }, [clientId, load]);

  const openDialog = () => {
    setDate(todayInput());
    setMetrics({ weightKg: '', bodyFatPercent: '', chestCm: '', waistCm: '', hipsCm: '', armCm: '', thighCm: '' });
    setNote('');
    setPhotos([]);
    setError('');
    setDialogOpen(true);
  };

  const hasMetric = METRICS.some((m) => metrics[m.key].trim() !== '');
  const canSave = hasMetric || photos.length > 0;

  const handleRegister = async () => {
    if (!clientId || !canSave) return;
    setSubmitting(true);
    setError('');
    try {
      const payload: RecordProgressData = { date: new Date(date).toISOString(), note: note.trim() || undefined };
      for (const m of METRICS) {
        const raw = metrics[m.key].trim();
        if (raw !== '') payload[m.key] = Number(raw);
      }
      await progressService.create(Number(clientId), payload, photos);
      setDialogOpen(false);
      setSaved(t('progress.registered'));
      load();
    } catch {
      setError(t('progress.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPhotos = async (entryId: number, files: FileList | null) => {
    if (!clientId || !files || files.length === 0) return;
    try {
      await progressService.addPhotos(Number(clientId), entryId, Array.from(files));
      setSaved(t('progress.photos.added'));
      load();
    } catch {
      setError(t('progress.photos.saveFailed'));
    }
  };

  const handleDeletePhoto = async () => {
    if (!clientId || !photoToDelete) return;
    try {
      await progressService.deletePhoto(Number(clientId), photoToDelete.entryId, photoToDelete.photoId);
      setPhotoToDelete(null);
      setSaved(t('progress.photos.deleted'));
      load();
    } catch {
      setError(t('progress.photos.deleteFailed'));
    }
  };

  const handleDelete = async () => {
    if (!clientId || !toDelete) return;
    try {
      await progressService.remove(Number(clientId), toDelete.id);
      setToDelete(null);
      setSaved(t('progress.deleted'));
      load();
    } catch {
      setError(t('progress.deleteFailed'));
    }
  };

  const clientName = client ? `${client.firstName} ${client.lastName}` : '';
  const fmt = (v: number | null | undefined) => (v == null ? '—' : v);
  const change =
    summary.weightChangeKg == null
      ? '—'
      : `${summary.weightChangeKg > 0 ? '+' : ''}${summary.weightChangeKg} kg`;

  return (
    <div>
      <BackButton to="/clients" />
      <Typography variant="h4" gutterBottom>
        {t('progress.title')}
      </Typography>
      {clientName && (
        <Typography color="text.secondary" gutterBottom>
          {t('progress.subtitle', { name: clientName })}
        </Typography>
      )}
      {error && !dialogOpen && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <SummaryStat label={t('progress.summary.latestWeight')} value={summary.latestWeightKg == null ? '—' : `${summary.latestWeightKg} kg`} />
        <SummaryStat label={t('progress.summary.weightChange')} value={change} />
        <SummaryStat label={t('progress.summary.entryCount')} value={summary.entryCount} />
      </Stack>

      <Button variant="contained" onClick={openDialog} sx={{ mb: 2 }}>
        {t('progress.register')}
      </Button>

      {entries.length === 0 ? (
        <Typography color="text.secondary">{t('progress.empty')}</Typography>
      ) : (
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('progress.columns.date')}</TableCell>
                {METRICS.map((m) => (
                  <TableCell key={m.key} align="right">
                    {t(`progress.metrics.${m.key}`)}
                  </TableCell>
                ))}
                <TableCell>{t('progress.columns.note')}</TableCell>
                <TableCell>{t('progress.columns.photos')}</TableCell>
                <TableCell align="right">{t('progress.columns.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{new Date(e.date).toLocaleDateString(i18n.language)}</TableCell>
                  {METRICS.map((m) => (
                    <TableCell key={m.key} align="right">
                      {fmt(e[m.key])}
                    </TableCell>
                  ))}
                  <TableCell>{e.note}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {e.photos.map((p) => (
                        <Box key={p.id} sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={progressService.photoUrl(Number(clientId), e.id, p.id)}
                            alt={t('progress.photos.alt')}
                            sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, display: 'block' }}
                          />
                          <Tooltip title={t('common.delete')}>
                            <IconButton
                              size="small"
                              color="error"
                              aria-label={t('progress.photos.deleteLabel')}
                              onClick={() => setPhotoToDelete({ entryId: e.id, photoId: p.id })}
                              sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper' }}
                            >
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ))}
                      <Tooltip title={t('progress.photos.add')}>
                        <IconButton size="small" component="label" aria-label={t('progress.photos.add')}>
                          <AddPhotoAlternateIcon fontSize="small" />
                          <input
                            hidden
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(ev) => {
                              handleAddPhotos(e.id, ev.target.files);
                              ev.target.value = '';
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('common.delete')}>
                      <IconButton size="small" color="error" aria-label={t('common.delete')} onClick={() => setToDelete(e)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('progress.register')}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                label={t('progress.dialog.date')}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            {METRICS.map((m) => (
              <Grid item xs={6} sm={4} key={m.key}>
                <TextField
                  label={`${t(`progress.metrics.${m.key}`)} (${m.unit})`}
                  type="number"
                  inputProps={{ min: 0, step: 'any' }}
                  value={metrics[m.key]}
                  onChange={(e) => setMetrics((prev) => ({ ...prev, [m.key]: e.target.value }))}
                  fullWidth
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField
                label={t('progress.dialog.note')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" startIcon={<AddPhotoAlternateIcon />}>
                {t('progress.photos.select')}
                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => setPhotos(e.target.files ? Array.from(e.target.files) : [])}
                />
              </Button>
              {photos.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {t('progress.photos.selectedCount', { count: photos.length })}
                </Typography>
              )}
            </Grid>
          </Grid>
          {!canSave && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('progress.dialog.atLeastOne')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleRegister} disabled={submitting || !canSave}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
        <DialogTitle>{t('progress.deleteConfirm')}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(photoToDelete)} onClose={() => setPhotoToDelete(null)}>
        <DialogTitle>{t('progress.photos.deleteConfirm')}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setPhotoToDelete(null)}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDeletePhoto}>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(saved)} autoHideDuration={3000} onClose={() => setSaved('')} message={saved} />
    </div>
  );
}
