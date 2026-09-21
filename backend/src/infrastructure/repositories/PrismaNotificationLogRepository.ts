import { PrismaClient } from '@prisma/client';
import {
  NotificationLogRepository,
  NotificationType,
} from '../../domain/repositories/NotificationLogRepository';

export class PrismaNotificationLogRepository implements NotificationLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async exists(clientId: number, type: NotificationType, referenceKey: string): Promise<boolean> {
    const found = await this.prisma.notificationLog.findUnique({
      where: { clientId_type_referenceKey: { clientId, type, referenceKey } },
    });
    return found !== null;
  }

  async record(clientId: number, type: NotificationType, referenceKey: string): Promise<void> {
    await this.prisma.notificationLog.create({ data: { clientId, type, referenceKey } });
  }
}
