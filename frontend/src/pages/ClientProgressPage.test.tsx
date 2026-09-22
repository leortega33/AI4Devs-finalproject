import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { ClientProgressPage } from './ClientProgressPage';
import { clientService } from '../services/clientService';
import { progressService } from '../services/progressService';

vi.mock('../services/clientService', () => ({ clientService: { get: vi.fn() } }));
vi.mock('../services/progressService', () => ({
  progressService: { list: vi.fn(), create: vi.fn(), remove: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ clientId: '10' }) };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ClientProgressPage />
    </MemoryRouter>,
  );
}

const emptyList = { entries: [], summary: { latestWeightKg: null, weightChangeKg: null, entryCount: 0 } };

describe('ClientProgressPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
    vi.mocked(clientService.get).mockResolvedValue({ id: 10, firstName: 'Ana', lastName: 'Gómez' } as never);
    vi.mocked(progressService.list).mockResolvedValue(emptyList as never);
  });

  it('shows the summary and the empty state', async () => {
    renderPage();

    expect(await screen.findByText('Peso actual')).toBeInTheDocument();
    expect(screen.getByText('Cambio de peso')).toBeInTheDocument();
    expect(screen.getByText(/todavía no tiene mediciones/i)).toBeInTheDocument();
  });

  it('lists entries with the weight summary', async () => {
    vi.mocked(progressService.list).mockResolvedValue({
      entries: [{ id: 1, clientId: 10, date: '2026-09-21T10:00:00.000Z', weightKg: 78, waistCm: 85, note: 'Buen progreso' }],
      summary: { latestWeightKg: 78, weightChangeKg: -4, entryCount: 3 },
    } as never);

    renderPage();

    expect(await screen.findByText('Buen progreso')).toBeInTheDocument();
    const weightCard = screen.getByText('Peso actual').closest('div');
    expect(within(weightCard as HTMLElement).getByText('78 kg')).toBeInTheDocument();
    const changeCard = screen.getByText('Cambio de peso').closest('div');
    expect(within(changeCard as HTMLElement).getByText('-4 kg')).toBeInTheDocument();
  });

  it('records a measurement', async () => {
    vi.mocked(progressService.create).mockResolvedValue({} as never);
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByRole('button', { name: /registrar medición/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/peso \(kg\)/i), '80');
    await user.click(within(dialog).getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(progressService.create).toHaveBeenCalledWith(10, expect.objectContaining({ weightKg: 80 })),
    );
  });

  it('deletes a measurement', async () => {
    vi.mocked(progressService.list).mockResolvedValue({
      entries: [{ id: 7, clientId: 10, date: '2026-09-21T10:00:00.000Z', weightKg: 80, note: 'X' }],
      summary: { latestWeightKg: 80, weightChangeKg: null, entryCount: 1 },
    } as never);
    vi.mocked(progressService.remove).mockResolvedValue(undefined as never);
    const user = userEvent.setup();

    renderPage();

    await screen.findByText('X');
    const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' });
    await user.click(deleteButtons[0]);
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(progressService.remove).toHaveBeenCalledWith(10, 7));
  });
});
