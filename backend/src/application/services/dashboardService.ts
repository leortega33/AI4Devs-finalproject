import {
  DashboardRepository,
  DashboardClientRow,
} from '../../domain/repositories/DashboardRepository';
import {
  Payment,
  PaymentMethod,
  computePaymentStatus,
  coveredPeriodEnd,
} from '../../domain/models/Payment';
import { RoutineTemplate } from '../../domain/models/RoutineTemplate';

export interface PaymentAlert {
  clientId: number;
  clientName: string;
  periodMonth?: number;
  periodYear?: number;
}

export interface RoutineAlert {
  clientId: number;
  clientName: string;
  endDate: string;
  expired: boolean;
}

export interface DashboardKpis {
  activeClients: number;
  upToDate: number;
  overdue: number;
  noPayments: number;
  monthlyIncome: number;
}

export interface Dashboard {
  overduePayments: PaymentAlert[];
  paymentsDueSoon: PaymentAlert[];
  noPayments: PaymentAlert[];
  expiringRoutines: RoutineAlert[];
  kpis: DashboardKpis;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Aggregates active clients into dashboard alert groups (see US-009). */
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboard(now: Date = new Date(), dueSoonDays = 5): Promise<Dashboard> {
    const rows = await this.dashboardRepository.getActiveClientsOverview();
    const dueSoonThreshold = new Date(now.getTime() + dueSoonDays * MS_PER_DAY);

    const dashboard: Dashboard = {
      overduePayments: [],
      paymentsDueSoon: [],
      noPayments: [],
      expiringRoutines: [],
      kpis: { activeClients: 0, upToDate: 0, overdue: 0, noPayments: 0, monthlyIncome: 0 },
    };

    for (const row of rows) {
      this.classifyPayments(row, now, dueSoonThreshold, dashboard);
      this.classifyRoutine(row, now, dueSoonThreshold, dashboard);
    }

    // Every active client is exactly one of overdue / no-payments / up-to-date.
    const monthlyIncome = await this.dashboardRepository.getMonthlyIncome(now);
    dashboard.kpis = {
      activeClients: rows.length,
      overdue: dashboard.overduePayments.length,
      noPayments: dashboard.noPayments.length,
      upToDate: rows.length - dashboard.overduePayments.length - dashboard.noPayments.length,
      monthlyIncome,
    };

    return dashboard;
  }

  private classifyPayments(
    row: DashboardClientRow,
    now: Date,
    dueSoonThreshold: Date,
    dashboard: Dashboard,
  ): void {
    const clientName = `${row.firstName} ${row.lastName}`;
    const payments = row.payments.map(
      (p) =>
        new Payment({
          clientId: row.id,
          amount: 0,
          paymentDate: now,
          method: 'cash' as PaymentMethod,
          periodMonth: p.periodMonth,
          periodYear: p.periodYear,
        }),
    );
    const status = computePaymentStatus(payments, now);

    if (status === 'no_payments') {
      dashboard.noPayments.push({ clientId: row.id, clientName });
      return;
    }

    const mostRecent = payments.reduce((a, b) => (b.periodKey > a.periodKey ? b : a));
    const alert: PaymentAlert = {
      clientId: row.id,
      clientName,
      periodMonth: mostRecent.periodMonth,
      periodYear: mostRecent.periodYear,
    };

    if (status === 'overdue') {
      dashboard.overduePayments.push(alert);
      return;
    }

    const end = coveredPeriodEnd(payments);
    if (end !== null && end.getTime() <= dueSoonThreshold.getTime()) {
      dashboard.paymentsDueSoon.push(alert);
    }
  }

  private classifyRoutine(
    row: DashboardClientRow,
    now: Date,
    dueSoonThreshold: Date,
    dashboard: Dashboard,
  ): void {
    if (!row.activeRoutine) {
      return;
    }
    const routine = new RoutineTemplate({
      name: '',
      clientId: row.id,
      startDate: row.activeRoutine.startDate,
      durationWeeks: row.activeRoutine.durationWeeks,
      status: 'active',
    });
    const end = routine.endDate;
    if (end !== null && end.getTime() <= dueSoonThreshold.getTime()) {
      dashboard.expiringRoutines.push({
        clientId: row.id,
        clientName: `${row.firstName} ${row.lastName}`,
        endDate: end.toISOString(),
        expired: routine.isExpired(now),
      });
    }
  }
}
