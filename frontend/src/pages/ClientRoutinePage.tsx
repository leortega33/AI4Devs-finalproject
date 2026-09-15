import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { TemplatePickerDialog } from '../components/TemplatePickerDialog';
import { clientService, type Client } from '../services/clientService';
import {
  clientRoutineService,
  type ClientRoutine,
  type RoutineHistoryItem,
} from '../services/clientRoutineService';
import type { RoutineTemplateSummary } from '../services/routineTemplateService';

export function ClientRoutinePage() {
  const { clientId } = useParams();
  const { t } = useTranslation();
  const [client, setClient] = useState<Client | null>(null);
  const [active, setActive] = useState<ClientRoutine | null>(null);
  const [history, setHistory] = useState<RoutineHistoryItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [template, setTemplate] = useState<RoutineTemplateSummary | null>(null);
  const [startDate, setStartDate] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('4');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!clientId) return;
    const id = Number(clientId);
    try {
      setActive(await clientRoutineService.getActive(id));
      setHistory(await clientRoutineService.getHistory(id));
    } catch {
      setError(t('clientRoutine.loadFailed'));
    }
  }, [clientId, t]);

  useEffect(() => {
    if (!clientId) return;
    clientService.get(Number(clientId)).then(setClient).catch(() => undefined);
    load();
  }, [clientId, load]);

  const assign = async () => {
    if (!clientId || !template || !startDate) return;
    setError('');
    try {
      await clientRoutineService.assign(Number(clientId), {
        templateId: template.id,
        startDate,
        durationWeeks: Number(durationWeeks),
      });
      setTemplate(null);
      setStartDate('');
      load();
    } catch {
      setError(t('clientRoutine.assignFailed'));
    }
  };

  const clientName = client ? `${client.firstName} ${client.lastName}` : '';

  return (
    <Box>
      <BackButton to="/clients" />
      <Typography variant="h4" gutterBottom>
        {t('clientRoutine.title')}
      </Typography>
      {clientName && (
        <Typography color="text.secondary" gutterBottom>
          {t('clientRoutine.subtitle', { name: clientName })}
        </Typography>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Assign routine */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('clientRoutine.assign')}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button variant="outlined" onClick={() => setPickerOpen(true)}>
              {template ? template.name : t('clientRoutine.picker.title')}
            </Button>
            <TextField
              label={t('clientRoutine.startDate')}
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              label={t('clientRoutine.durationWeeks')}
              type="number"
              size="small"
              inputProps={{ min: 1 }}
              sx={{ width: 160 }}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(e.target.value)}
            />
            <Button variant="contained" disabled={!template || !startDate} onClick={assign}>
              {t('clientRoutine.assign')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Active routine */}
      <Typography variant="h6" gutterBottom>
        {t('clientRoutine.activeTitle')}
      </Typography>
      {active ? (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1">{active.name}</Typography>
              {active.isExpired && <Chip size="small" color="warning" label={t('clientRoutine.expired')} />}
            </Stack>
            {active.endDate && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('clientRoutine.endDate')}: {active.endDate.slice(0, 10)}
              </Typography>
            )}
            {active.sessions.map((session) => (
              <Box key={session.id} sx={{ mt: 2 }}>
                <Divider textAlign="left" sx={{ mb: 1 }}>
                  {session.name}
                </Divider>
                {session.entries.map((entry) => (
                  <Typography key={entry.id} variant="body2">
                    • {entry.exerciseName}
                    {entry.series != null || entry.reps != null || entry.kg != null
                      ? ` — ${entry.series ?? '-'}x${entry.reps ?? '-'} @ ${entry.kg ?? '-'}kg`
                      : ''}
                  </Typography>
                ))}
              </Box>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('clientRoutine.empty')}
        </Alert>
      )}

      {/* History */}
      <Typography variant="h6" gutterBottom>
        {t('clientRoutine.historyTitle')}
      </Typography>
      {history.length === 0 ? (
        <Typography color="text.secondary">{t('clientRoutine.historyEmpty')}</Typography>
      ) : (
        <List dense>
          {history.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.name}
                secondary={`${item.objective ?? ''} · ${item.sessionCount} ${t('clientRoutine.sessions')}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      <TemplatePickerDialog
        open={pickerOpen}
        onCancel={() => setPickerOpen(false)}
        onChoose={(tpl) => {
          setTemplate(tpl);
          setPickerOpen(false);
        }}
      />
    </Box>
  );
}
