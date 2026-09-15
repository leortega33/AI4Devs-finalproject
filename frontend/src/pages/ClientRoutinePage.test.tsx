import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { ClientRoutinePage } from './ClientRoutinePage';
import { clientService } from '../services/clientService';
import { clientRoutineService } from '../services/clientRoutineService';
import { routineTemplateService } from '../services/routineTemplateService';

vi.mock('../services/clientService', () => ({ clientService: { get: vi.fn() } }));
vi.mock('../services/clientRoutineService', () => ({
  clientRoutineService: { getActive: vi.fn(), getHistory: vi.fn(), assign: vi.fn() },
}));
vi.mock('../services/routineTemplateService', () => ({
  routineTemplateService: { list: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ clientId: '3' }) };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ClientRoutinePage />
    </MemoryRouter>,
  );
}

describe('ClientRoutinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
    vi.mocked(clientService.get).mockResolvedValue({ id: 3, firstName: 'John', lastName: 'Doe' } as never);
    vi.mocked(clientRoutineService.getHistory).mockResolvedValue([] as never);
    vi.mocked(routineTemplateService.list).mockResolvedValue([
      { id: 1, name: 'Hipertrofia', objective: 'Fuerza', status: 'draft', sessionCount: 1 },
    ] as never);
  });

  it('should show the empty state when the client has no active routine', async () => {
    vi.mocked(clientRoutineService.getActive).mockResolvedValue(null);

    renderPage();

    expect(await screen.findByText(/todavía no tiene una rutina asignada/i)).toBeInTheDocument();
  });

  it('should show the active routine when present', async () => {
    vi.mocked(clientRoutineService.getActive).mockResolvedValue({
      id: 5,
      name: 'Rutina activa',
      clientId: 3,
      status: 'active',
      endDate: '2026-03-01',
      isExpired: false,
      sessions: [
        { id: 10, name: 'Sesión A', order: 0, entries: [{ id: 100, exerciseId: 7, exerciseName: 'Sentadilla', phase: 'main', order: 0, series: 4, reps: 8, kg: 60 }] },
      ],
    } as never);

    renderPage();

    expect(await screen.findByText('Rutina activa')).toBeInTheDocument();
    expect(screen.getByText(/Sentadilla/)).toBeInTheDocument();
  });

  it('should assign a routine from a chosen template', async () => {
    vi.mocked(clientRoutineService.getActive).mockResolvedValue(null);
    vi.mocked(clientRoutineService.assign).mockResolvedValue({} as never);
    const user = userEvent.setup();

    renderPage();
    await screen.findByText(/todavía no tiene una rutina asignada/i);

    // Open the template picker and choose a template.
    await user.click(screen.getByRole('button', { name: /elegir plantilla/i }));
    await user.click(await screen.findByText('Hipertrofia'));

    // Wait for the picker dialog to close (aria-hidden lifts), then fill and assign.
    const assignButton = await screen.findByRole('button', { name: /^asignar rutina$/i });
    await user.type(screen.getByLabelText(/fecha de inicio/i), '2026-02-01');
    await user.click(assignButton);

    await waitFor(() =>
      expect(clientRoutineService.assign).toHaveBeenCalledWith(
        3,
        expect.objectContaining({ templateId: 1, startDate: '2026-02-01', durationWeeks: 4 }),
      ),
    );
  });
});
