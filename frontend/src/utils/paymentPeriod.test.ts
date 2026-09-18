import { nextOwedPeriod, isIncoherentPeriod } from './paymentPeriod';
import type { Payment } from '../services/paymentService';

function payment(periodYear: number, periodMonth: number): Payment {
  return {
    id: 1,
    clientId: 1,
    amount: 100,
    paymentDate: '2026-01-01',
    method: 'cash',
    periodMonth,
    periodYear,
  };
}

const NOW = new Date('2026-09-18');

describe('nextOwedPeriod', () => {
  it('should default to the current month when there are no payments', () => {
    expect(nextOwedPeriod([], NOW)).toEqual({ month: 9, year: 2026 });
  });

  it('should return most-recent-covered + 1 month when behind', () => {
    expect(nextOwedPeriod([payment(2026, 7), payment(2026, 5)], NOW)).toEqual({ month: 8, year: 2026 });
  });

  it('should roll over December to January of the next year', () => {
    expect(nextOwedPeriod([payment(2025, 12)], new Date('2026-01-10'))).toEqual({ month: 1, year: 2026 });
  });

  it('should return the current month when the most recent period is already current or future', () => {
    expect(nextOwedPeriod([payment(2026, 9)], NOW)).toEqual({ month: 9, year: 2026 });
    expect(nextOwedPeriod([payment(2026, 12)], NOW)).toEqual({ month: 9, year: 2026 });
  });
});

describe('isIncoherentPeriod', () => {
  it('should flag a period more than one month ahead of the payment date', () => {
    expect(isIncoherentPeriod({ month: 11, year: 2026 }, '2026-07-05')).toBe(true);
  });

  it('should allow a period within one month ahead', () => {
    expect(isIncoherentPeriod({ month: 8, year: 2026 }, '2026-07-05')).toBe(false);
    expect(isIncoherentPeriod({ month: 7, year: 2026 }, '2026-07-05')).toBe(false);
  });

  it('should flag a period more than twelve months old', () => {
    expect(isIncoherentPeriod({ month: 6, year: 2025 }, '2026-07-05')).toBe(true);
  });

  it('should allow a recent past period', () => {
    expect(isIncoherentPeriod({ month: 5, year: 2026 }, '2026-07-05')).toBe(false);
  });

  it('should not flag when the payment date is invalid', () => {
    expect(isIncoherentPeriod({ month: 11, year: 2026 }, '')).toBe(false);
  });
});
