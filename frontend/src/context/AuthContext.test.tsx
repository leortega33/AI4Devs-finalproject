import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

function Consumer() {
  const { user, isLoading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <button onClick={() => login('admin@example.com', 'secret')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should check the current session on load', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({ id: 1, email: 'admin@example.com' });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('admin@example.com');
  });

  it('should set the user with no active session', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('none'));
  });

  it('should update the user after a successful login', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);
    vi.mocked(authService.login).mockResolvedValue({ id: 1, email: 'admin@example.com' });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    screen.getByText('login').click();

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('admin@example.com'));
  });

  it('should clear the user after logout', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({ id: 1, email: 'admin@example.com' });
    vi.mocked(authService.logout).mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('admin@example.com'));

    screen.getByText('logout').click();

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('none'));
  });
});
