import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { ClientAttendancePage } from './ClientAttendancePage';
import { clientService } from '../services/clientService';
import { attendanceService } from '../services/attendanceService';

vi.mock('../services/clientService', () => ({ clientService: { get: vi.fn() } }));
vi.mock('../services/attendanceService', () => ({
  attendanceService: { list: vi.fn(), create: vi.fn(), remove: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ clientId: '10' }) };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ClientAttendancePage />
    </MemoryRouter>,
  );
}

const emptyList = { attendances: [], summary: { total: 0, thisMonth: 0, last30Days: 0, lastCheckInAt: null } };

describe('ClientAttendancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
    vi.mocked(clientService.get).mockResolvedValue({ id: 10, firstName: 'Ana', lastName: 'Gómez' } as never);
    vi.mocked(attendanceService.list).mockResolvedValue(emptyList as never);
  });

  it('shows the summary and the empty state', async () => {
    renderPage();

    expect(await screen.findByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Últimos 30 días')).toBeInTheDocument();
    expect(screen.getByText(/todavía no tiene asistencias/i)).toBeInTheDocument();
  });

  it('lists check-ins with a summary', async () => {
    vi.mocked(attendanceService.list).mockResolvedValue({
      attendances: [{ id: 1, clientId: 10, checkInAt: '2026-09-20T10:00:00.000Z', note: 'Buena sesión' }],
      summary: { total: 4, thisMonth: 3, last30Days: 4, lastCheckInAt: '2026-09-20T10:00:00.000Z' },
    } as never);

    renderPage();

    expect(await screen.findByText('Buena sesión')).toBeInTheDocument();
    // The "Total" summary card shows 4.
    const totalCard = screen.getByText('Total').closest('div');
    expect(within(totalCard as HTMLElement).getByText('4')).toBeInTheDocument();
  });

  it('registers a check-in', async () => {
    vi.mocked(attendanceService.create).mockResolvedValue({} as never);
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByRole('button', { name: /registrar asistencia/i }));
    // The dialog note field.
    await user.type(screen.getByLabelText(/nota \(opcional\)/i), 'Entrenó fuerte');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(attendanceService.create).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ note: 'Entrenó fuerte' }),
      ),
    );
  });

  it('deletes a check-in', async () => {
    vi.mocked(attendanceService.list).mockResolvedValue({
      attendances: [{ id: 7, clientId: 10, checkInAt: '2026-09-20T10:00:00.000Z', note: 'X' }],
      summary: { total: 1, thisMonth: 1, last30Days: 1, lastCheckInAt: '2026-09-20T10:00:00.000Z' },
    } as never);
    vi.mocked(attendanceService.remove).mockResolvedValue(undefined as never);
    const user = userEvent.setup();

    renderPage();

    // Wait for the row to render, then click its delete icon.
    await screen.findByText('X');
    const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' });
    await user.click(deleteButtons[0]);
    // Confirm dialog.
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(attendanceService.remove).toHaveBeenCalledWith(10, 7));
  });
});
