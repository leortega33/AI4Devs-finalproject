import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeactivateClientDialog } from './DeactivateClientDialog';

describe('DeactivateClientDialog', () => {
  it('should show the client name and call onConfirm', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <DeactivateClientDialog open clientName="John Doe" onCancel={onCancel} onConfirm={onConfirm} />,
    );

    expect(screen.getByText(/deactivate john doe/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^deactivate$/i }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('should call onCancel', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <DeactivateClientDialog open clientName="John Doe" onCancel={onCancel} onConfirm={vi.fn()} />,
    );
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});
