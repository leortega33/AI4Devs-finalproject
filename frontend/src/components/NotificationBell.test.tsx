import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { NotificationBell } from './NotificationBell';
import { dashboardService, type Dashboard } from '../services/dashboardService';

vi.mock('../services/dashboardService', () => ({
  dashboardService: { get: vi.fn() },
}));

function dashboard(overrides: Partial<Dashboard> = {}): Dashboard {
  return {
    overduePayments: [],
    paymentsDueSoon: [],
    noPayments: [],
    expiringRoutines: [],
    kpis: { activeClients: 0, upToDate: 0, overdue: 0, noPayments: 0, monthlyIncome: 0 },
    ...overrides,
  };
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
    localStorage.clear();
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

  it('clears the badge once the alerts have been seen', async () => {
    vi.mocked(dashboardService.get).mockResolvedValue(
      dashboard({ overduePayments: [{ clientId: 1, clientName: 'Ana' }] }),
    );
    const user = userEvent.setup();

    renderBell();
    const badge = await screen.findByText('1');
    expect(badge).not.toHaveClass('MuiBadge-invisible');

    await user.click(screen.getByRole('button', { name: /notificaciones/i }));

    // After opening, the alert set is marked as seen and the badge becomes invisible.
    await waitFor(() => expect(screen.getByText('1')).toHaveClass('MuiBadge-invisible'));
  });
});
