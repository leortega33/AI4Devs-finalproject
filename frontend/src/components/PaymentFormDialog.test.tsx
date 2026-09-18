import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../i18n';
import { PaymentFormDialog } from './PaymentFormDialog';
import type { Payment } from '../services/paymentService';

function payment(periodYear: number, periodMonth: number): Payment {
  return { id: 1, clientId: 3, amount: 100, paymentDate: '2026-01-01', method: 'cash', periodMonth, periodYear };
}

describe('PaymentFormDialog', () => {
  beforeEach(() => i18n.changeLanguage('es'));

  it('should reject a non-positive amount', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<PaymentFormDialog open payment={null} payments={[]} onCancel={vi.fn()} onSave={onSave} />);

    const amount = screen.getByLabelText(/monto/i);
    await user.clear(amount);
    await user.type(amount, '0');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText(/ingresá un monto válido/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should save a valid payment', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<PaymentFormDialog open payment={null} payments={[]} onCancel={vi.fn()} onSave={onSave} />);

    const amount = screen.getByLabelText(/monto/i);
    await user.clear(amount);
    await user.type(amount, '5000');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ amount: 5000, method: 'cash' })),
    );
  });

  it('should allow clearing the amount field without snapping back to 0', async () => {
    const user = userEvent.setup();
    render(
      <PaymentFormDialog
        open
        payment={{
          id: 1,
          clientId: 3,
          amount: 1000,
          paymentDate: '2026-02-05',
          method: 'cash',
          periodMonth: 2,
          periodYear: 2026,
        }}
        payments={[]}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    const amount = screen.getByLabelText(/monto/i);
    await user.clear(amount);

    expect(amount).toHaveValue(null);
  });

  it('should preload values when editing', () => {
    render(
      <PaymentFormDialog
        open
        payment={{
          id: 1,
          clientId: 3,
          amount: 7500,
          paymentDate: '2026-02-05',
          method: 'card',
          periodMonth: 2,
          periodYear: 2026,
        }}
        payments={[]}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/monto/i)).toHaveValue(7500);
  });

  it('should default a new payment period to the next owed month', () => {
    // A clearly-past covered period so the "most recent + 1" default is
    // deterministic regardless of the machine clock.
    render(
      <PaymentFormDialog open payment={null} payments={[payment(2000, 1)]} onCancel={vi.fn()} onSave={vi.fn()} />,
    );

    expect(screen.getByLabelText(/mes del período/i)).toHaveValue(2);
    expect(screen.getByLabelText(/año del período/i)).toHaveValue(2000);
  });

  it('should show a coherence warning when the period is inconsistent with the date', () => {
    // Default period Feb 2000 vs today's payment date → clearly incoherent.
    render(
      <PaymentFormDialog open payment={null} payments={[payment(2000, 1)]} onCancel={vi.fn()} onSave={vi.fn()} />,
    );

    expect(screen.getByText(/no coincide con la fecha de pago/i)).toBeInTheDocument();
  });

  it('should not warn for a coherent default (current month, no prior payments)', () => {
    render(<PaymentFormDialog open payment={null} payments={[]} onCancel={vi.fn()} onSave={vi.fn()} />);

    expect(screen.queryByText(/no coincide con la fecha de pago/i)).not.toBeInTheDocument();
  });
});
