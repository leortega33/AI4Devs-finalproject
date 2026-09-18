import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { ClientPaymentsPage } from './ClientPaymentsPage';
import { clientService } from '../services/clientService';
import { paymentService } from '../services/paymentService';

vi.mock('../services/clientService', () => ({ clientService: { get: vi.fn() } }));
vi.mock('../services/paymentService', () => ({
  paymentService: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), exportPdf: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ clientId: '3' }) };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ClientPaymentsPage />
    </MemoryRouter>,
  );
}

describe('ClientPaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
    vi.mocked(clientService.get).mockResolvedValue({ id: 3, firstName: 'John', lastName: 'Doe' } as never);
  });

  it('should show the empty state and the no-payments status', async () => {
    vi.mocked(paymentService.list).mockResolvedValue({ payments: [], status: 'no_payments' } as never);

    renderPage();

    expect(await screen.findByText(/todavía no tiene pagos registrados/i)).toBeInTheDocument();
    expect(screen.getByText('Sin pagos')).toBeInTheDocument();
    // No summary panel in the empty state.
    expect(screen.queryByText(/total pagado/i)).not.toBeInTheDocument();
  });

  it('should show a summary panel with total, count and period range', async () => {
    vi.mocked(paymentService.list).mockResolvedValue({
      payments: [
        { id: 1, clientId: 3, amount: 15000, paymentDate: '2026-07-05', method: 'cash', periodMonth: 7, periodYear: 2026 },
        { id: 2, clientId: 3, amount: 12000, paymentDate: '2026-08-05', method: 'cash', periodMonth: 8, periodYear: 2026 },
      ],
      status: 'up_to_date',
    } as never);

    renderPage();

    expect(await screen.findByText(/total pagado/i)).toBeInTheDocument();
    expect(screen.getByText('27000')).toBeInTheDocument();
    expect(screen.getByText(/cantidad de pagos/i)).toBeInTheDocument();
    expect(screen.getByText('07/2026 – 08/2026')).toBeInTheDocument();
  });

  it('should list payments with the up-to-date status', async () => {
    vi.mocked(paymentService.list).mockResolvedValue({
      payments: [
        { id: 1, clientId: 3, amount: 5000, paymentDate: '2026-02-05', method: 'cash', periodMonth: 2, periodYear: 2026 },
      ],
      status: 'up_to_date',
    } as never);

    renderPage();

    expect(await screen.findByText('Al día')).toBeInTheDocument();
    expect(screen.getByText('02/2026')).toBeInTheDocument();
  });

  it('should register a payment', async () => {
    vi.mocked(paymentService.list).mockResolvedValue({ payments: [], status: 'no_payments' } as never);
    vi.mocked(paymentService.create).mockResolvedValue({} as never);
    const user = userEvent.setup();

    renderPage();
    await screen.findByText(/todavía no tiene pagos registrados/i);

    await user.click(screen.getByRole('button', { name: /registrar pago/i }));
    const amount = await screen.findByLabelText(/monto/i);
    await user.clear(amount);
    await user.type(amount, '5000');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(paymentService.create).toHaveBeenCalledWith(3, expect.objectContaining({ amount: 5000 })),
    );
  });

  it('should export the payment history as PDF', async () => {
    vi.mocked(paymentService.list).mockResolvedValue({ payments: [], status: 'no_payments' } as never);
    vi.mocked(paymentService.exportPdf).mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderPage();
    await screen.findByText(/todavía no tiene pagos registrados/i);

    await user.click(screen.getByRole('button', { name: /exportar pdf/i }));

    await waitFor(() => expect(paymentService.exportPdf).toHaveBeenCalledWith(3, 'es'));
  });
});
