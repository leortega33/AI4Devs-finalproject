import { PrismaClient, Prisma } from '@prisma/client';
import { Payment, PaymentMethod } from '../../domain/models/Payment';
import { PaymentRepository, PaymentInput } from '../../domain/repositories/PaymentRepository';

type PaymentRecord = Prisma.PaymentGetPayload<Record<string, never>>;

function toDomain(record: PaymentRecord): Payment {
  return new Payment({
    id: record.id,
    clientId: record.clientId,
    amount: record.amount.toNumber(),
    paymentDate: record.paymentDate,
    method: record.method as PaymentMethod,
    periodMonth: record.periodMonth,
    periodYear: record.periodYear,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(clientId: number, data: PaymentInput): Promise<Payment> {
    const record = await this.prisma.payment.create({ data: { clientId, ...data } });
    return toDomain(record);
  }

  async findById(id: number): Promise<Payment | null> {
    const record = await this.prisma.payment.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async findByClient(clientId: number): Promise<Payment[]> {
    const records = await this.prisma.payment.findMany({
      where: { clientId },
      orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }],
    });
    return records.map(toDomain);
  }

  async update(id: number, data: PaymentInput): Promise<Payment> {
    const record = await this.prisma.payment.update({ where: { id }, data });
    return toDomain(record);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.payment.delete({ where: { id } });
  }
}
