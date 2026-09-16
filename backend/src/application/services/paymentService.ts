import { Payment, PaymentStatus, computePaymentStatus } from '../../domain/models/Payment';
import { PaymentRepository, PaymentInput } from '../../domain/repositories/PaymentRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ClientNotFoundError } from './clientService';

export { computePaymentStatus };
export type { PaymentStatus };

export class PaymentNotFoundError extends Error {
  constructor() {
    super('Payment not found');
    this.name = 'PaymentNotFoundError';
  }
}

export interface ClientPayments {
  payments: Payment[];
  status: PaymentStatus;
}

/** Business logic for client payments (see US-007). */
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async register(clientId: number, data: PaymentInput): Promise<Payment> {
    await this.ensureClientExists(clientId);
    return this.paymentRepository.create(clientId, data);
  }

  async listByClient(clientId: number): Promise<ClientPayments> {
    await this.ensureClientExists(clientId);
    const payments = await this.paymentRepository.findByClient(clientId);
    return { payments, status: computePaymentStatus(payments) };
  }

  async update(id: number, data: PaymentInput): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new PaymentNotFoundError();
    }
    return this.paymentRepository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new PaymentNotFoundError();
    }
    await this.paymentRepository.delete(id);
  }

  private async ensureClientExists(clientId: number): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundError();
    }
  }
}
