import { Payment, PaymentMethod } from '../models/Payment';

/** Input for creating or updating a payment (no id; clientId set on create). */
export interface PaymentInput {
  amount: number;
  paymentDate: Date;
  method: PaymentMethod;
  periodMonth: number;
  periodYear: number;
}

/** Data access contract for client payments (see docs/backend-standards.md). */
export interface PaymentRepository {
  create(clientId: number, data: PaymentInput): Promise<Payment>;
  findById(id: number): Promise<Payment | null>;
  findByClient(clientId: number): Promise<Payment[]>;
  update(id: number, data: PaymentInput): Promise<Payment>;
  delete(id: number): Promise<void>;
}
