import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../i18n';
import { PaymentFormDialog } from './PaymentFormDialog';

describe('PaymentFormDialog', () => {
  beforeEach(() => i18n.changeLanguage('es'));

  it('should reject a non-positive amount', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<PaymentFormDialog open payment={null} onCancel={vi.fn()} onSave={onSave} />);

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
    render(<PaymentFormDialog open payment={null} onCancel={vi.fn()} onSave={onSave} />);

    const amount = screen.getByLabelText(/monto/i);
    await user.clear(amount);
    await user.type(amount, '5000');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ amount: 5000, method: 'cash' })),
    );
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
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/monto/i)).toHaveValue(7500);
  });
});
