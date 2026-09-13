import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: { requestPasswordReset: vi.fn() },
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show a generic confirmation message after submitting', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    expect(await screen.findByText(/se envió un enlace/i)).toBeInTheDocument();
    expect(authService.requestPasswordReset).toHaveBeenCalledWith('admin@example.com');
  });

  it('should show an error and not the confirmation when the request fails', async () => {
    vi.mocked(authService.requestPasswordReset).mockRejectedValue(new Error('network'));
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    expect(await screen.findByText(/no se pudo completar/i)).toBeInTheDocument();
    expect(screen.queryByText(/se envió un enlace/i)).not.toBeInTheDocument();
  });
});
