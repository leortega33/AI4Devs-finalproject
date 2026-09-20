/** Read-model row for the dashboard aggregation (see US-009). */
export interface DashboardClientRow {
  id: number;
  firstName: string;
  lastName: string;
  payments: { periodMonth: number; periodYear: number }[];
  activeRoutine: { startDate: Date; durationWeeks: number } | null;
}

/** Read-only aggregation over active clients for the dashboard (see US-009). */
export interface DashboardRepository {
  getActiveClientsOverview(): Promise<DashboardClientRow[]>;
  // Sum of payment amounts whose paymentDate falls within the month of `now` (US-020).
  getMonthlyIncome(now: Date): Promise<number>;
}
