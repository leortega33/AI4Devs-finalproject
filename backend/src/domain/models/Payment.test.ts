import { Payment } from './Payment';

describe('Payment', () => {
  const baseProps = {
    clientId: 1,
    amount: 5000,
    paymentDate: new Date('2026-02-05'),
    method: 'cash' as const,
    periodMonth: 2,
    periodYear: 2026,
  };

  it('should hold the provided values', () => {
    const payment = new Payment({ ...baseProps, id: 3 });

    expect(payment.id).toBe(3);
    expect(payment.amount).toBe(5000);
    expect(payment.method).toBe('cash');
    expect(payment.periodMonth).toBe(2);
  });

  it('should expose a sortable period key', () => {
    const feb2026 = new Payment(baseProps);
    const jan2026 = new Payment({ ...baseProps, periodMonth: 1 });
    const dec2025 = new Payment({ ...baseProps, periodMonth: 12, periodYear: 2025 });

    expect(feb2026.periodKey).toBeGreaterThan(jan2026.periodKey);
    expect(jan2026.periodKey).toBeGreaterThan(dec2025.periodKey);
  });
});
