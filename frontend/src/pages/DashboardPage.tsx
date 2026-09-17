import { useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/PageHeader';
import { AlertList, type AlertItem } from '../components/AlertList';
import { LoadingSkeleton } from '../components/skeletons/LoadingSkeleton';
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
  const { t, i18n } = useTranslation();
  const [dashboard, setDashboard] = useState<Dashboard>(EMPTY_DASHBOARD);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .get()
      .then(setDashboard)
      .catch(() => setError(t('dashboard.loadFailed')))
      .finally(() => setLoading(false));
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
      <PageHeader title={t('auth.dashboard.title')} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingSkeleton variant="cards" count={4} />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          <AlertList
            title={t('dashboard.overdueTitle')}
            items={paymentItems(dashboard.overduePayments)}
            color="error"
            icon={<ErrorOutlineIcon />}
          />
          <AlertList
            title={t('dashboard.dueSoonTitle')}
            items={paymentItems(dashboard.paymentsDueSoon)}
            color="warning"
            icon={<WarningAmberIcon />}
          />
          <AlertList
            title={t('dashboard.noPaymentsTitle')}
            items={paymentItems(dashboard.noPayments)}
            color="info"
            icon={<MoneyOffIcon />}
          />
          <AlertList
            title={t('dashboard.expiringRoutinesTitle')}
            items={routineItems(dashboard.expiringRoutines)}
            color="warning"
            icon={<EventBusyIcon />}
          />
        </Box>
      )}
    </Box>
  );
}
