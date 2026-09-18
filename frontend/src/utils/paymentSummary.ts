import type { Payment } from '../services/paymentService';

export interface Period {
  month: number; // 1-12
  year: number;
}

export interface PaymentSummary {
  totalPaid: number;
  count: number;
  firstPeriod: Period | null;
  lastPeriod: Period | null;
}

function periodIndex(year: number, month: number): number {
  return year * 12 + (month - 1);
}

/**
 * Aggregates a client's payments: total amount, count, and the covered-period
 * range (earliest and latest period by year/month), or null ranges when empty.
 */
export function summarizePayments(payments: Payment[]): PaymentSummary {
  if (payments.length === 0) {
    return { totalPaid: 0, count: 0, firstPeriod: null, lastPeriod: null };
  }
  let totalPaid = 0;
  let first = payments[0];
  let last = payments[0];
  for (const p of payments) {
    totalPaid += p.amount;
    if (periodIndex(p.periodYear, p.periodMonth) < periodIndex(first.periodYear, first.periodMonth)) {
      first = p;
    }
    if (periodIndex(p.periodYear, p.periodMonth) > periodIndex(last.periodYear, last.periodMonth)) {
      last = p;
    }
  }
  return {
    totalPaid,
    count: payments.length,
    firstPeriod: { month: first.periodMonth, year: first.periodYear },
    lastPeriod: { month: last.periodMonth, year: last.periodYear },
  };
}

// Display a period as zero-padded MM/YYYY.
export function formatPeriod(period: Period): string {
  return `${String(period.month).padStart(2, '0')}/${period.year}`;
}
