import { PrismaClient } from '@prisma/client';
import {
  DashboardRepository,
  DashboardClientRow,
} from '../../domain/repositories/DashboardRepository';

/** Prisma-backed read model for the dashboard aggregation (see US-009). */
export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getActiveClientsOverview(): Promise<DashboardClientRow[]> {
    const records = await this.prisma.client.findMany({
      where: { status: 'active' },
      orderBy: { lastName: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        payments: { select: { periodMonth: true, periodYear: true } },
        routines: {
          where: { status: 'active' },
          select: { startDate: true, durationWeeks: true },
          take: 1,
        },
      },
    });

    return records.map((record) => {
      const routine = record.routines[0];
      return {
        id: record.id,
        firstName: record.firstName,
        lastName: record.lastName,
        payments: record.payments,
        activeRoutine:
          routine && routine.startDate !== null && routine.durationWeeks !== null
            ? { startDate: routine.startDate, durationWeeks: routine.durationWeeks }
            : null,
      };
    });
  }

  async getMonthlyIncome(now: Date): Promise<number> {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const result = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paymentDate: { gte: monthStart, lt: nextMonthStart } },
    });
    return Number(result._sum.amount ?? 0);
  }
}
