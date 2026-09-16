export type PaymentMethod = 'cash' | 'bank_transfer' | 'card';

export type PaymentStatus = 'up_to_date' | 'overdue' | 'no_payments';

export interface PaymentProps {
  id?: number;
  clientId: number;
  amount: number;
  paymentDate: Date;
  method: PaymentMethod;
  periodMonth: number;
  periodYear: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/** A payment registered for a client (see docs/data-model.md entity #8, US-007). */
export class Payment {
  readonly id?: number;
  readonly clientId: number;
  readonly amount: number;
  readonly paymentDate: Date;
  readonly method: PaymentMethod;
  readonly periodMonth: number;
  readonly periodYear: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: PaymentProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.amount = props.amount;
    this.paymentDate = props.paymentDate;
    this.method = props.method;
    this.periodMonth = props.periodMonth;
    this.periodYear = props.periodYear;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** A sortable key for the covered period (year * 12 + month). */
  get periodKey(): number {
    return this.periodYear * 12 + this.periodMonth;
  }
}

/**
 * Derives a client's payment status from their payments (US-007):
 * overdue when today is past the end of the month covered by the most recent
 * payment, up to date otherwise, and no_payments when there are none.
 */
export function computePaymentStatus(payments: Payment[], now: Date = new Date()): PaymentStatus {
  if (payments.length === 0) {
    return 'no_payments';
  }
  const mostRecent = payments.reduce((a, b) => (b.periodKey > a.periodKey ? b : a));
  // Last day of the covered month (JS month is 0-indexed; day 0 = last day of the prior month).
  const endOfCoveredMonth = new Date(
    mostRecent.periodYear,
    mostRecent.periodMonth,
    0,
    23,
    59,
    59,
    999,
  );
  return now.getTime() > endOfCoveredMonth.getTime() ? 'overdue' : 'up_to_date';
}
