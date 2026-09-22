import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { ClientNutritionPage } from './ClientNutritionPage';
import { clientService } from '../services/clientService';
import { nutritionService } from '../services/nutritionService';

vi.mock('../services/clientService', () => ({ clientService: { get: vi.fn() } }));
vi.mock('../services/nutritionService', () => ({
  nutritionService: { getPlan: vi.fn(), savePlan: vi.fn(), getVersions: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ clientId: '10' }) };
});

const emptyPlan = { dailyCalories: null, proteinTargetG: null, generalNotes: null, meals: [] };

function renderPage() {
  return render(
    <MemoryRouter>
      <ClientNutritionPage />
    </MemoryRouter>,
  );
}

describe('ClientNutritionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
    vi.mocked(clientService.get).mockResolvedValue({ id: 10, firstName: 'Ana', lastName: 'Gómez' } as never);
    vi.mocked(nutritionService.getPlan).mockResolvedValue(emptyPlan as never);
    vi.mocked(nutritionService.getVersions).mockResolvedValue([] as never);
  });

  it('loads an existing plan into the editor', async () => {
    vi.mocked(nutritionService.getPlan).mockResolvedValue({
      dailyCalories: 2200,
      proteinTargetG: 150,
      generalNotes: 'Agua',
      meals: [{ name: 'Desayuno', note: null, items: [{ description: 'Avena', quantity: '80 g' }] }],
    } as never);

    renderPage();

    expect(await screen.findByDisplayValue('Desayuno')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Avena')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2200')).toBeInTheDocument();
  });

  it('adds a meal and a food item, then saves', async () => {
    vi.mocked(nutritionService.savePlan).mockResolvedValue(emptyPlan as never);
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Agregar comida' }));
    const mealCard = await screen.findByTestId('meal-card');
    await user.type(within(mealCard).getByLabelText('Nombre de la comida'), 'Almuerzo');
    await user.click(within(mealCard).getByRole('button', { name: 'Agregar alimento' }));
    await user.type(within(mealCard).getByLabelText('Alimento'), 'Pollo');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(nutritionService.savePlan).toHaveBeenCalledWith(
        10,
        expect.objectContaining({
          meals: [
            expect.objectContaining({
              name: 'Almuerzo',
              items: [expect.objectContaining({ description: 'Pollo' })],
            }),
          ],
        }),
      ),
    );
  });

  it('disables save while a meal is missing its name', async () => {
    vi.mocked(nutritionService.getPlan).mockResolvedValue({
      ...emptyPlan,
      meals: [{ name: '', note: null, items: [] }],
    } as never);

    renderPage();

    await screen.findByTestId('meal-card');
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('shows the version history when toggled', async () => {
    vi.mocked(nutritionService.getVersions).mockResolvedValue([
      { id: 2, snapshot: { meals: [{ name: 'A', items: [] }] }, createdAt: '2026-09-21T11:00:00.000Z' },
    ] as never);
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Historial' }));

    await waitFor(() => expect(nutritionService.getVersions).toHaveBeenCalledWith(10));
    expect(await screen.findByText('1 comida(s)')).toBeInTheDocument();
  });
});
