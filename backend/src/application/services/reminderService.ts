import { DashboardService, PaymentAlert, RoutineAlert } from './dashboardService';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import {
  NotificationLogRepository,
  NotificationType,
} from '../../domain/repositories/NotificationLogRepository';
import { EmailService } from '../../infrastructure/email/emailService';

export interface ReminderSummary {
  sent: number;
  skippedNoEmail: number;
  skippedDuplicate: number;
}

interface ReminderCandidate {
  clientId: number;
  clientName: string;
  type: NotificationType;
  referenceKey: string;
  subject: string;
  body: string;
}

function paymentPeriodKey(alert: PaymentAlert): string {
  return `${alert.periodYear}-${String(alert.periodMonth).padStart(2, '0')}`;
}

/**
 * Emails clients who have a dashboard alert (overdue/due-soon payments, expiring
 * routines), deduplicating each specific alert via the notification log (US-024).
 * Message content is in Spanish (the client's language).
 */
export class ReminderService {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly clientRepository: ClientRepository,
    private readonly notificationLogRepository: NotificationLogRepository,
    private readonly emailService: EmailService,
  ) {}

  async run(now: Date = new Date()): Promise<ReminderSummary> {
    const dashboard = await this.dashboardService.getDashboard(now);
    const candidates = [
      ...dashboard.overduePayments.map((a) => this.overduePaymentCandidate(a)),
      ...dashboard.paymentsDueSoon.map((a) => this.dueSoonPaymentCandidate(a)),
      ...dashboard.expiringRoutines.map((a) => this.expiringRoutineCandidate(a)),
    ];

    const summary: ReminderSummary = { sent: 0, skippedNoEmail: 0, skippedDuplicate: 0 };

    for (const candidate of candidates) {
      const client = await this.clientRepository.findById(candidate.clientId);
      if (!client || !client.email) {
        summary.skippedNoEmail += 1;
        continue;
      }
      if (await this.notificationLogRepository.exists(candidate.clientId, candidate.type, candidate.referenceKey)) {
        summary.skippedDuplicate += 1;
        continue;
      }
      await this.emailService.sendEmail(client.email, candidate.subject, candidate.body);
      await this.notificationLogRepository.record(candidate.clientId, candidate.type, candidate.referenceKey);
      summary.sent += 1;
    }

    return summary;
  }

  private overduePaymentCandidate(alert: PaymentAlert): ReminderCandidate {
    const period = paymentPeriodKey(alert);
    return {
      clientId: alert.clientId,
      clientName: alert.clientName,
      type: 'payment_overdue',
      referenceKey: period,
      subject: 'Recordatorio: pago vencido',
      body: `Hola ${alert.clientName}, tenés un pago vencido correspondiente al período ${alert.periodMonth}/${alert.periodYear}. Por favor regularizá tu cuota. ¡Gracias!`,
    };
  }

  private dueSoonPaymentCandidate(alert: PaymentAlert): ReminderCandidate {
    const period = paymentPeriodKey(alert);
    return {
      clientId: alert.clientId,
      clientName: alert.clientName,
      type: 'payment_due_soon',
      referenceKey: period,
      subject: 'Recordatorio: pago por vencer',
      body: `Hola ${alert.clientName}, tu pago del período ${alert.periodMonth}/${alert.periodYear} está por vencer. Te recordamos abonarlo a tiempo. ¡Gracias!`,
    };
  }

  private expiringRoutineCandidate(alert: RoutineAlert): ReminderCandidate {
    return {
      clientId: alert.clientId,
      clientName: alert.clientName,
      type: 'routine_expiring',
      referenceKey: alert.endDate,
      subject: 'Recordatorio: tu rutina está por vencer',
      body: `Hola ${alert.clientName}, tu rutina de entrenamiento vence el ${alert.endDate.slice(0, 10)}. Coordiná con tu entrenador para renovarla.`,
    };
  }
}
