import { DashboardService } from './dashboardService';
import { DashboardRepository, DashboardClientRow } from '../../domain/repositories/DashboardRepository';

function buildRepoMock(rows: DashboardClientRow[]): jest.Mocked<DashboardRepository> {
  return { getActiveClientsOverview: jest.fn().mockResolvedValue(rows) };
}

function row(overrides: Partial<DashboardClientRow>): DashboardClientRow {
  return {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    payments: [],
    activeRoutine: null,
    ...overrides,
  };
}

describe('DashboardService', () => {
  describe('payment classification', () => {
    it('should put a client with an overdue payment in the overdue group', async () => {
      const now = new Date('2026-09-15T12:00:00');
      const repo = buildRepoMock([
        row({ id: 1, payments: [{ periodMonth: 8, periodYear: 2026 }] }),
      ]);
      const service = new DashboardService(repo);

      const result = await service.getDashboard(now, 5);

      expect(result.overduePayments).toEqual([
        { clientId: 1, clientName: 'John Doe', periodMonth: 8, periodYear: 2026 },
      ]);
      expect(result.paymentsDueSoon).toHaveLength(0);
      expect(result.noPayments).toHaveLength(0);
    });

    it('should put an up-to-date client whose period ends within the window in due-soon', async () => {
      const now = new Date('2026-09-27T12:00:00');
      const repo = buildRepoMock([
        row({ id: 2, payments: [{ periodMonth: 9, periodYear: 2026 }] }),
      ]);
      const service = new DashboardService(repo);

      const result = await service.getDashboard(now, 5);

      expect(result.paymentsDueSoon).toEqual([
        { clientId: 2, clientName: 'John Doe', periodMonth: 9, periodYear: 2026 },
      ]);
      expect(result.overduePayments).toHaveLength(0);
    });

    it('should omit an up-to-date client whose period ends beyond the window', async () => {
      const now = new Date('2026-09-05T12:00:00');
      const repo = buildRepoMock([
        row({ id: 3, payments: [{ periodMonth: 9, periodYear: 2026 }] }),
      ]);
      const service = new DashboardService(repo);

      const result = await service.getDashboard(now, 5);

      expect(result.overduePayments).toHaveLength(0);
      expect(result.paymentsDueSoon).toHaveLength(0);
      expect(result.noPayments).toHaveLength(0);
    });

    it('should put a client with no payments in its own group', async () => {
      const now = new Date('2026-09-15T12:00:00');
      const repo = buildRepoMock([row({ id: 4, payments: [] })]);
      const service = new DashboardService(repo);

      const result = await service.getDashboard(now, 5);

      expect(result.noPayments).toEqual([{ clientId: 4, clientName: 'John Doe' }]);
      expect(result.overduePayments).toHaveLength(0);
    });
  });

  describe('routine classification', () => {
    it('should flag an expired routine as expiring with expired=true', async () => {
      const now = new Date('2026-09-15T12:00:00');
      const repo = buildRepoMock([
        row({
          id: 5,
          payments: [{ periodMonth: 9, periodYear: 2026 }],
          activeRoutine: { startDate: new Date('2026-08-01'), durationWeeks: 4 },
        }),
      ]);
      const service = new DashboardService(repo);

      const result = await service.getDashboard(now, 5);

      expect(result.expiringRoutines).toHaveLength(1);
      expect(result.expiringRoutines[0]).toMatchObject({ clientId: 5, expired: true });
    });

    it('should flag a routine ending within the window as expiring with expired=false', async () => {
      const now = new Date('2026-09-15T12:00:00');
      const repo = buildRepoMock([
        row({
          id: 6,
          payments: [{ periodMonth: 9, periodYear: 2026 }],
          activeRoutine: { startDate: new Date('2026-08-20'), durationWeeks: 4 },
        }),
      ]);
      const service = new DashboardService(repo);

      const result = await service.getDashboard(now, 5);

      expect(result.expiringRoutines).toHaveLength(1);
      expect(result.expiringRoutines[0]).toMatchObject({ clientId: 6, expired: false });
    });

    it('should omit a routine ending beyond the window', async () => {
      const now = new Date('2026-09-15T12:00:00');
      const repo = buildRepoMock([
        row({
          id: 7,
          payments: [{ periodMonth: 9, periodYear: 2026 }],
          activeRoutine: { startDate: new Date('2026-09-10'), durationWeeks: 4 },
        }),
      ]);
      const service = new DashboardService(repo);

      const result = await service.getDashboard(now, 5);

      expect(result.expiringRoutines).toHaveLength(0);
    });
  });

  it('should return all-empty groups when no client has any alert', async () => {
    const now = new Date('2026-09-05T12:00:00');
    const repo = buildRepoMock([
      row({ id: 8, payments: [{ periodMonth: 9, periodYear: 2026 }], activeRoutine: null }),
    ]);
    const service = new DashboardService(repo);

    const result = await service.getDashboard(now, 5);

    expect(result).toEqual({
      overduePayments: [],
      paymentsDueSoon: [],
      noPayments: [],
      expiringRoutines: [],
    });
  });

  it('should work with default now/threshold arguments', async () => {
    const repo = buildRepoMock([]);
    const service = new DashboardService(repo);

    const result = await service.getDashboard();

    expect(repo.getActiveClientsOverview).toHaveBeenCalled();
    expect(result).toEqual({
      overduePayments: [],
      paymentsDueSoon: [],
      noPayments: [],
      expiringRoutines: [],
    });
  });
});
