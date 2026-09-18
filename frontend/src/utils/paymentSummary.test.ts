import { summarizePayments, formatPeriod } from './paymentSummary';
import type { Payment } from '../services/paymentService';

function payment(periodYear: number, periodMonth: number, amount: number): Payment {
  return { id: 1, clientId: 1, amount, paymentDate: '2026-01-01', method: 'cash', periodMonth, periodYear };
}

describe('summarizePayments', () => {
  it('should return an empty summary when there are no payments', () => {
    expect(summarizePayments([])).toEqual({ totalPaid: 0, count: 0, firstPeriod: null, lastPeriod: null });
  });

  it('should total the amounts and count the payments', () => {
    const result = summarizePayments([payment(2026, 7, 15000), payment(2026, 8, 12000)]);
    expect(result.totalPaid).toBe(27000);
    expect(result.count).toBe(2);
  });

  it('should compute the covered-period range across years', () => {
    const result = summarizePayments([payment(2026, 3, 100), payment(2025, 11, 100), payment(2026, 1, 100)]);
    expect(result.firstPeriod).toEqual({ month: 11, year: 2025 });
    expect(result.lastPeriod).toEqual({ month: 3, year: 2026 });
  });
});

describe('formatPeriod', () => {
  it('should zero-pad the month', () => {
    expect(formatPeriod({ month: 2, year: 2026 })).toBe('02/2026');
    expect(formatPeriod({ month: 12, year: 2026 })).toBe('12/2026');
  });
});
