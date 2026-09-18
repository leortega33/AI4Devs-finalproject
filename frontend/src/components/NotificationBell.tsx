import { useState, type MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Badge,
  Divider,
  IconButton,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useTranslation } from 'react-i18next';
import { useDashboardAlerts } from '../hooks/useDashboardAlerts';
import type { PaymentAlert, RoutineAlert } from '../services/dashboardService';

/** Persistent top-bar bell surfacing the dashboard alerts from any screen (US-013). */
export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const { dashboard, total } = useDashboardAlerts();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const open = (e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const close = () => setAnchor(null);

  const paymentDetail = (a: PaymentAlert) =>
    a.periodMonth && a.periodYear
      ? t('dashboard.period', { month: String(a.periodMonth).padStart(2, '0'), year: a.periodYear })
      : undefined;

  const routineDetail = (a: RoutineAlert) =>
    a.expired
      ? t('dashboard.routineExpired')
      : t('dashboard.routineExpiresOn', { date: new Date(a.endDate).toLocaleDateString(i18n.language) });

  const groups: { title: string; to: (id: number) => string; items: { clientId: number; clientName: string; detail?: string }[] }[] = [
    {
      title: t('dashboard.overdueTitle'),
      to: (id) => `/clients/${id}/payments`,
      items: dashboard.overduePayments.map((a) => ({ ...a, detail: paymentDetail(a) })),
    },
    {
      title: t('dashboard.dueSoonTitle'),
      to: (id) => `/clients/${id}/payments`,
      items: dashboard.paymentsDueSoon.map((a) => ({ ...a, detail: paymentDetail(a) })),
    },
    {
      title: t('dashboard.noPaymentsTitle'),
      to: (id) => `/clients/${id}/payments`,
      items: dashboard.noPayments.map((a) => ({ clientId: a.clientId, clientName: a.clientName })),
    },
    {
      title: t('dashboard.expiringRoutinesTitle'),
      to: (id) => `/clients/${id}/routine`,
      items: dashboard.expiringRoutines.map((a) => ({ ...a, detail: routineDetail(a) })),
    },
  ];

  return (
    <>
      <IconButton aria-label={t('notifications.aria')} onClick={open} color="inherit">
        <Badge badgeContent={total} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        slotProps={{ paper: { sx: { width: 340, maxHeight: 420 } } }}
      >
        {total === 0 ? (
          <MenuItem disabled>{t('notifications.empty')}</MenuItem>
        ) : (
          groups
            .filter((g) => g.items.length > 0)
            .flatMap((g, gi) => [
              gi > 0 ? <Divider key={`d-${g.title}`} /> : null,
              <ListSubheader key={`h-${g.title}`} disableSticky>
                {g.title}
              </ListSubheader>,
              ...g.items.map((item) => (
                <MenuItem
                  key={`${g.title}-${item.clientId}`}
                  component={RouterLink}
                  to={g.to(item.clientId)}
                  onClick={close}
                >
                  <ListItemText primary={item.clientName} secondary={item.detail} />
                </MenuItem>
              )),
            ])
        )}
      </Menu>
    </>
  );
}
