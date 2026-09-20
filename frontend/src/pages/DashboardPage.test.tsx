import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { DashboardPage } from './DashboardPage';
import { dashboardService } from '../services/dashboardService';

vi.mock('../services/dashboardService', () => ({
  dashboardService: { get: vi.fn() },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
  });

  it('renders the Panel heading, the KPI cards and the four alert groups', async () => {
    vi.mocked(dashboardService.get).mockResolvedValue({
      overduePayments: [],
      paymentsDueSoon: [],
      noPayments: [],
      expiringRoutines: [],
      kpis: { activeClients: 3, upToDate: 1, overdue: 1, noPayments: 1, monthlyIncome: 27000 },
    });

    renderPage();

    expect(screen.getByRole('heading', { name: 'Panel' })).toBeInTheDocument();
    expect(await screen.findByText('Pagos vencidos')).toBeInTheDocument();
    expect(screen.getByText('Pagos por vencer')).toBeInTheDocument();
    expect(screen.getByText('Clientes sin pagos')).toBeInTheDocument();
    expect(screen.getByText('Rutinas por vencer')).toBeInTheDocument();
    // KPI cards.
    expect(screen.getByText('Clientes activos')).toBeInTheDocument();
    expect(screen.getByText('Ingreso del mes')).toBeInTheDocument();
    expect(screen.getByText(/27[.,\s]?000/)).toBeInTheDocument();
  });

  it('lists an overdue client linking to their payments', async () => {
    vi.mocked(dashboardService.get).mockResolvedValue({
      overduePayments: [{ clientId: 3, clientName: 'Pago Cliente', periodMonth: 8, periodYear: 2026 }],
      paymentsDueSoon: [],
      noPayments: [],
      expiringRoutines: [],
      kpis: { activeClients: 1, upToDate: 0, overdue: 1, noPayments: 0, monthlyIncome: 0 },
    });

    renderPage();

    const link = await screen.findByRole('link', { name: /Pago Cliente/ });
    expect(link).toHaveAttribute('href', '/clients/3/payments');
  });
});
