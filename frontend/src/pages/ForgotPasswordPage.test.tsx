import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: { requestPasswordReset: vi.fn() },
}));

describe('ForgotPasswordPage', () => {
  it('should show a generic confirmation message after submitting', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText(/reset link was sent/i)).toBeInTheDocument();
    expect(authService.requestPasswordReset).toHaveBeenCalledWith('admin@example.com');
  });
});
