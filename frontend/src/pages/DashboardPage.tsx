import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AlertList, type AlertItem } from '../components/AlertList';
import {
  dashboardService,
  type Dashboard,
  type PaymentAlert,
  type RoutineAlert,
} from '../services/dashboardService';

const EMPTY_DASHBOARD: Dashboard = {
  overduePayments: [],
  paymentsDueSoon: [],
  noPayments: [],
  expiringRoutines: [],
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [dashboard, setDashboard] = useState<Dashboard>(EMPTY_DASHBOARD);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService
      .get()
      .then(setDashboard)
      .catch(() => setError(t('dashboard.loadFailed')));
  }, [t]);

  const paymentItems = (alerts: PaymentAlert[]): AlertItem[] =>
    alerts.map((a) => ({
      clientId: a.clientId,
      clientName: a.clientName,
      to: `/clients/${a.clientId}/payments`,
      detail:
        a.periodMonth && a.periodYear
          ? t('dashboard.period', { month: String(a.periodMonth).padStart(2, '0'), year: a.periodYear })
          : undefined,
    }));

  const routineItems = (alerts: RoutineAlert[]): AlertItem[] =>
    alerts.map((a) => ({
      clientId: a.clientId,
      clientName: a.clientName,
      to: `/clients/${a.clientId}/routine`,
      detail: a.expired
        ? t('dashboard.routineExpired')
        : t('dashboard.routineExpiresOn', {
            date: new Date(a.endDate).toLocaleDateString(i18n.language),
          }),
    }));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t('auth.dashboard.title')}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained" onClick={() => navigate('/clients')}>
          {t('auth.dashboard.clients')}
        </Button>
        <Button variant="outlined" onClick={() => navigate('/exercises')}>
          {t('exercises.title')}
        </Button>
        <Button variant="outlined" onClick={() => navigate('/routines')}>
          {t('routines.title')}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <AlertList title={t('dashboard.overdueTitle')} items={paymentItems(dashboard.overduePayments)} color="error" />
        <AlertList title={t('dashboard.dueSoonTitle')} items={paymentItems(dashboard.paymentsDueSoon)} color="warning" />
        <AlertList title={t('dashboard.noPaymentsTitle')} items={paymentItems(dashboard.noPayments)} color="default" />
        <AlertList
          title={t('dashboard.expiringRoutinesTitle')}
          items={routineItems(dashboard.expiringRoutines)}
          color="warning"
        />
      </Box>
    </Box>
  );
}
