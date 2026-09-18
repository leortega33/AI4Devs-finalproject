import type { Payment } from '../services/paymentService';

export interface Period {
  month: number; // 1-12
  year: number;
}

// A comparable index for a (year, month) period.
function periodIndex(year: number, month: number): number {
  return year * 12 + (month - 1);
}

function currentPeriod(now: Date): Period {
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

/**
 * The next period a client owes: the most recent covered period + 1 month, or
 * the current month when there are no payments or the most recent covered period
 * is already the current month or in the future.
 */
export function nextOwedPeriod(payments: Payment[], now: Date = new Date()): Period {
  const current = currentPeriod(now);
  if (payments.length === 0) {
    return current;
  }
  const mostRecent = payments.reduce((a, b) =>
    periodIndex(b.periodYear, b.periodMonth) > periodIndex(a.periodYear, a.periodMonth) ? b : a,
  );
  const currentIndex = periodIndex(current.year, current.month);
  const recentIndex = periodIndex(mostRecent.periodYear, mostRecent.periodMonth);
  if (recentIndex >= currentIndex) {
    return current;
  }
  // Most recent covered period + 1 month, rolling over December.
  const nextIndex = recentIndex + 1;
  return { month: (nextIndex % 12) + 1, year: Math.floor(nextIndex / 12) };
}

/**
 * True when a chosen period is clearly inconsistent with the payment date: more
 * than one month ahead of the payment date's month (paying well in advance), or
 * more than twelve months before it (suspiciously old).
 */
export function isIncoherentPeriod(period: Period, paymentDate: string): boolean {
  const date = new Date(paymentDate);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const dateIndex = periodIndex(date.getFullYear(), date.getMonth() + 1);
  const chosenIndex = periodIndex(period.year, period.month);
  const diff = chosenIndex - dateIndex;
  return diff > 1 || diff < -12;
}
