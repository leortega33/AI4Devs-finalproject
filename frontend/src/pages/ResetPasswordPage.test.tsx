import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ResetPasswordPage } from './ResetPasswordPage';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: { resetPassword: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderWithToken(token = 'valid-token') {
  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      <ResetPasswordPage />
    </MemoryRouter>,
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject a password shorter than 8 characters', async () => {
    const user = userEvent.setup();
    renderWithToken();

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'short');
    await user.click(screen.getByRole('button', { name: /actualizar contraseña/i }));

    expect(await screen.findByText(/al menos 8 caracteres/i)).toBeInTheDocument();
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('should navigate to /login after a successful reset', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithToken('valid-token');

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'longenough1');
    await user.click(screen.getByRole('button', { name: /actualizar contraseña/i }));

    expect(authService.resetPassword).toHaveBeenCalledWith('valid-token', 'longenough1');
  });

  it('should show an error when the token is invalid or expired', async () => {
    vi.mocked(authService.resetPassword).mockRejectedValue(new Error('invalid'));
    const user = userEvent.setup();
    renderWithToken('bad-token');

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'longenough1');
    await user.click(screen.getByRole('button', { name: /actualizar contraseña/i }));

    expect(await screen.findByText(/inválido o expiró/i)).toBeInTheDocument();
  });
});
