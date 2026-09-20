import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { dashboardService, type Dashboard } from '../services/dashboardService';

const EMPTY: Dashboard = {
  overduePayments: [],
  paymentsDueSoon: [],
  noPayments: [],
  expiringRoutines: [],
  kpis: { activeClients: 0, upToDate: 0, overdue: 0, noPayments: 0, monthlyIncome: 0 },
};

function totalAlerts(d: Dashboard): number {
  return (
    d.overduePayments.length +
    d.paymentsDueSoon.length +
    d.noPayments.length +
    d.expiringRoutines.length
  );
}

/** Fetches the dashboard alerts for the notification bell (US-013). Refetches on route change. */
export function useDashboardAlerts() {
  const { pathname } = useLocation();
  const [dashboard, setDashboard] = useState<Dashboard>(EMPTY);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setDashboard(await dashboardService.get());
    } catch {
      setDashboard(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload, pathname]);

  return { dashboard, total: totalAlerts(dashboard), loading, reload };
}
