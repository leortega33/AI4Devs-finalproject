import { ReminderService } from './reminderService';
import { DashboardService, Dashboard } from './dashboardService';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { NotificationLogRepository } from '../../domain/repositories/NotificationLogRepository';
import { EmailService } from '../../infrastructure/email/emailService';
import { Client } from '../../domain/models/Client';

function emptyDashboard(): Dashboard {
  return {
    overduePayments: [],
    paymentsDueSoon: [],
    noPayments: [],
    expiringRoutines: [],
    kpis: { activeClients: 0, upToDate: 0, overdue: 0, noPayments: 0, monthlyIncome: 0 },
  };
}

function makeClient(id: number, email: string): Client {
  return new Client({
    id,
    firstName: 'Ana',
    lastName: 'Gómez',
    dni: `3000000${id}`,
    phone: '+540000',
    email,
    birthDate: new Date('1990-01-01'),
  });
}

describe('ReminderService', () => {
  let dashboardService: jest.Mocked<DashboardService>;
  let clientRepo: jest.Mocked<ClientRepository>;
  let logRepo: jest.Mocked<NotificationLogRepository>;
  let email: jest.Mocked<EmailService>;
  let service: ReminderService;

  beforeEach(() => {
    jest.clearAllMocks();
    dashboardService = { getDashboard: jest.fn() } as unknown as jest.Mocked<DashboardService>;
    clientRepo = { findById: jest.fn() } as unknown as jest.Mocked<ClientRepository>;
    logRepo = { exists: jest.fn().mockResolvedValue(false), record: jest.fn() } as unknown as jest.Mocked<NotificationLogRepository>;
    email = { sendEmail: jest.fn(), sendPasswordResetEmail: jest.fn() } as unknown as jest.Mocked<EmailService>;
    service = new ReminderService(dashboardService, clientRepo, logRepo, email);
  });

  it('sends an overdue-payment reminder and records it', async () => {
    dashboardService.getDashboard.mockResolvedValue({
      ...emptyDashboard(),
      overduePayments: [{ clientId: 10, clientName: 'Ana Gómez', periodMonth: 7, periodYear: 2026 }],
    });
    clientRepo.findById.mockResolvedValue(makeClient(10, 'ana@example.com'));

    const summary = await service.run(new Date('2026-09-20'));

    expect(email.sendEmail).toHaveBeenCalledWith(
      'ana@example.com',
      'Recordatorio: pago vencido',
      expect.stringContaining('7/2026'),
    );
    expect(logRepo.record).toHaveBeenCalledWith(10, 'payment_overdue', '2026-07');
    expect(summary).toEqual({ sent: 1, skippedNoEmail: 0, skippedDuplicate: 0 });
  });

  it('sends due-soon payment and expiring-routine reminders', async () => {
    dashboardService.getDashboard.mockResolvedValue({
      ...emptyDashboard(),
      paymentsDueSoon: [{ clientId: 11, clientName: 'B', periodMonth: 9, periodYear: 2026 }],
      expiringRoutines: [{ clientId: 12, clientName: 'C', endDate: '2026-10-01T00:00:00.000Z', expired: false }],
    });
    clientRepo.findById.mockImplementation(async (id) => makeClient(id, `c${id}@example.com`));

    const summary = await service.run();

    expect(email.sendEmail).toHaveBeenCalledTimes(2);
    expect(logRepo.record).toHaveBeenCalledWith(11, 'payment_due_soon', '2026-09');
    expect(logRepo.record).toHaveBeenCalledWith(12, 'routine_expiring', '2026-10-01T00:00:00.000Z');
    expect(summary.sent).toBe(2);
  });

  it('does not resend an already-logged alert', async () => {
    dashboardService.getDashboard.mockResolvedValue({
      ...emptyDashboard(),
      overduePayments: [{ clientId: 10, clientName: 'Ana', periodMonth: 7, periodYear: 2026 }],
    });
    clientRepo.findById.mockResolvedValue(makeClient(10, 'ana@example.com'));
    logRepo.exists.mockResolvedValue(true);

    const summary = await service.run();

    expect(email.sendEmail).not.toHaveBeenCalled();
    expect(logRepo.record).not.toHaveBeenCalled();
    expect(summary).toEqual({ sent: 0, skippedNoEmail: 0, skippedDuplicate: 1 });
  });

  it('skips a client without an email', async () => {
    dashboardService.getDashboard.mockResolvedValue({
      ...emptyDashboard(),
      overduePayments: [{ clientId: 10, clientName: 'Ana', periodMonth: 7, periodYear: 2026 }],
    });
    clientRepo.findById.mockResolvedValue(makeClient(10, ''));

    const summary = await service.run();

    expect(email.sendEmail).not.toHaveBeenCalled();
    expect(summary).toEqual({ sent: 0, skippedNoEmail: 1, skippedDuplicate: 0 });
  });

  it('returns a zero summary when there are no alerts', async () => {
    dashboardService.getDashboard.mockResolvedValue(emptyDashboard());

    expect(await service.run()).toEqual({ sent: 0, skippedNoEmail: 0, skippedDuplicate: 0 });
  });
});
