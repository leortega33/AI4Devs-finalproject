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
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { clientService, type Client } from '../services/clientService';
import {
  attendanceService,
  type Attendance,
  type AttendanceSummary,
} from '../services/attendanceService';

const EMPTY_SUMMARY: AttendanceSummary = { total: 0, thisMonth: 0, last30Days: 0, lastCheckInAt: null };

/** Local datetime string (yyyy-MM-ddTHH:mm) for the default check-in value. */
function nowLocalInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 120 }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  );
}

export function ClientAttendancePage() {
  const { clientId } = useParams();
  const { t, i18n } = useTranslation();
  const [client, setClient] = useState<Client | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>(EMPTY_SUMMARY);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkInAt, setCheckInAt] = useState(nowLocalInput());
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState<Attendance | null>(null);

  const load = useCallback(async () => {
    if (!clientId) return;
    try {
      const data = await attendanceService.list(Number(clientId));
      setAttendances(data.attendances);
      setSummary(data.summary);
    } catch {
      setError(t('attendance.loadFailed'));
    }
  }, [clientId, t]);

  useEffect(() => {
    if (!clientId) return;
    clientService.get(Number(clientId)).then(setClient).catch(() => undefined);
    load();
  }, [clientId, load]);

  const openDialog = () => {
    setCheckInAt(nowLocalInput());
    setNote('');
    setDialogOpen(true);
  };

  const handleRegister = async () => {
    if (!clientId) return;
    setSubmitting(true);
    setError('');
    try {
      await attendanceService.create(Number(clientId), {
        checkInAt: new Date(checkInAt).toISOString(),
        note: note.trim() || undefined,
      });
      setDialogOpen(false);
      setSaved(t('attendance.registered'));
      load();
    } catch {
      setError(t('attendance.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!clientId || !toDelete) return;
    try {
      await attendanceService.remove(Number(clientId), toDelete.id);
      setToDelete(null);
      setSaved(t('attendance.deleted'));
      load();
    } catch {
      setError(t('attendance.deleteFailed'));
    }
  };

  const clientName = client ? `${client.firstName} ${client.lastName}` : '';
  const lastCheckIn = summary.lastCheckInAt
    ? new Date(summary.lastCheckInAt).toLocaleDateString(i18n.language)
    : '—';

  return (
    <div>
      <BackButton to="/clients" />
      <Typography variant="h4" gutterBottom>
        {t('attendance.title')}
      </Typography>
      {clientName && (
        <Typography color="text.secondary" gutterBottom>
          {t('attendance.subtitle', { name: clientName })}
        </Typography>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <SummaryStat label={t('attendance.summary.total')} value={summary.total} />
        <SummaryStat label={t('attendance.summary.thisMonth')} value={summary.thisMonth} />
        <SummaryStat label={t('attendance.summary.last30Days')} value={summary.last30Days} />
        <SummaryStat label={t('attendance.summary.lastCheckIn')} value={lastCheckIn} />
      </Stack>

      <Button variant="contained" onClick={openDialog} sx={{ mb: 2 }}>
        {t('attendance.register')}
      </Button>

      {attendances.length === 0 ? (
        <Typography color="text.secondary">{t('attendance.empty')}</Typography>
      ) : (
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('attendance.columns.checkInAt')}</TableCell>
                <TableCell>{t('attendance.columns.note')}</TableCell>
                <TableCell align="right">{t('attendance.columns.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendances.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{new Date(a.checkInAt).toLocaleString(i18n.language)}</TableCell>
                  <TableCell>{a.note}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('common.delete')}>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={t('common.delete')}
                        onClick={() => setToDelete(a)}
                      >
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('attendance.register')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('attendance.dialog.checkInAt')}
              type="datetime-local"
              value={checkInAt}
              onChange={(e) => setCheckInAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label={t('attendance.dialog.note')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleRegister} disabled={submitting}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
        <DialogTitle>{t('attendance.deleteConfirm')}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(saved)} autoHideDuration={3000} onClose={() => setSaved('')} message={saved} />
    </div>
  );
}
