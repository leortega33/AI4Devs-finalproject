import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '../i18n';
import { AppLayout } from './AppLayout';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/clients']}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<div>Home content</div>} />
          <Route path="/clients" element={<div>Clients content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppLayout', () => {
  beforeEach(() => {
    i18n.changeLanguage('es');
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, email: 'admin@example.com' },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('should render the branded app bar with the logo and the routed content', () => {
    renderLayout();

    expect(screen.getByRole('img', { name: /logo/i })).toBeInTheDocument();
    expect(screen.getByText('SPORT – FITNESS')).toBeInTheDocument();
    expect(screen.getByText('Clients content')).toBeInTheDocument();
  });

  it('should invoke logout from the app bar', async () => {
    const logout = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, email: 'admin@example.com' },
      isLoading: false,
      login: vi.fn(),
      logout,
    });
    const user = userEvent.setup();

    renderLayout();
    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('should expose the language switcher in the app bar', () => {
    renderLayout();

    expect(screen.getByRole('combobox', { name: /idioma/i })).toBeInTheDocument();
  });
});
