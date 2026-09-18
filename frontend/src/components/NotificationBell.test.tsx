import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { NotificationBell } from './NotificationBell';
import { dashboardService, type Dashboard } from '../services/dashboardService';

vi.mock('../services/dashboardService', () => ({
  dashboardService: { get: vi.fn() },
}));

function dashboard(overrides: Partial<Dashboard> = {}): Dashboard {
  return { overduePayments: [], paymentsDueSoon: [], noPayments: [], expiringRoutines: [], ...overrides };
}

function renderBell() {
  return render(
    <MemoryRouter>
      <NotificationBell />
    </MemoryRouter>,
  );
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
  });

  it('shows the total alert count in the badge', async () => {
    vi.mocked(dashboardService.get).mockResolvedValue(
      dashboard({
        overduePayments: [{ clientId: 1, clientName: 'Ana', periodMonth: 8, periodYear: 2026 }],
        noPayments: [{ clientId: 2, clientName: 'Beto' }],
      }),
    );

    renderBell();

    expect(await screen.findByText('2')).toBeInTheDocument();
  });

  it('opens the dropdown and links alerts to the client', async () => {
    vi.mocked(dashboardService.get).mockResolvedValue(
      dashboard({
        overduePayments: [{ clientId: 7, clientName: 'Ana García', periodMonth: 8, periodYear: 2026 }],
      }),
    );
    const user = userEvent.setup();

    renderBell();
    await screen.findByText('1');
    await user.click(screen.getByRole('button', { name: /notificaciones/i }));

    const link = await screen.findByRole('menuitem', { name: /Ana García/ });
    expect(link).toHaveAttribute('href', '/clients/7/payments');
  });

  it('shows an empty state when there are no alerts', async () => {
    vi.mocked(dashboardService.get).mockResolvedValue(dashboard());
    const user = userEvent.setup();

    renderBell();
    // Give the initial fetch time to resolve.
    await screen.findByRole('button', { name: /notificaciones/i });
    await user.click(screen.getByRole('button', { name: /notificaciones/i }));

    expect(await screen.findByText('No hay alertas')).toBeInTheDocument();
  });
});
