import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { RoutineTemplateBuilderPage } from './RoutineTemplateBuilderPage';
import { routineTemplateService } from '../services/routineTemplateService';
import { exerciseService } from '../services/exerciseService';

vi.mock('../services/routineTemplateService', () => ({
  routineTemplateService: { get: vi.fn(), create: vi.fn(), update: vi.fn() },
}));

vi.mock('../services/exerciseService', () => ({
  exerciseService: { list: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({}) };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <RoutineTemplateBuilderPage />
    </MemoryRouter>,
  );
}

describe('RoutineTemplateBuilderPage (create)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
    vi.mocked(exerciseService.list).mockResolvedValue([
      { id: 7, name: 'Sentadilla', muscleGroup: 'Piernas', category: 'main' },
    ] as never);
  });

  it('should require a routine name', async () => {
    const user = userEvent.setup();
    renderPage();

    // Give the default session a name so the name-validation triggers first.
    await user.type(screen.getByRole('textbox', { name: /nombre de la sesión/i }), 'Sesión A');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    expect(await screen.findByText(/ingresá un nombre para la rutina/i)).toBeInTheDocument();
    expect(routineTemplateService.create).not.toHaveBeenCalled();
  });

  it('should build a routine with an exercise and save it', async () => {
    vi.mocked(routineTemplateService.create).mockResolvedValue({} as never);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Hipertrofia');
    await user.type(screen.getByRole('textbox', { name: /nombre de la sesión/i }), 'Sesión A');

    // Add a main-phase exercise via the picker.
    await user.click(screen.getAllByRole('button', { name: /agregar ejercicio/i })[1]);
    await user.click(await screen.findByText('Sentadilla'));

    // The picker dialog closes (aria-hidden lifts) before the save button is reachable.
    await user.click(await screen.findByRole('button', { name: /^guardar$/i }));

    await waitFor(() =>
      expect(routineTemplateService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Hipertrofia',
          sessions: expect.arrayContaining([
            expect.objectContaining({
              name: 'Sesión A',
              entries: expect.arrayContaining([
                expect.objectContaining({ exerciseId: 7, phase: 'main' }),
              ]),
            }),
          ]),
        }),
      ),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/routines');
  });
});
