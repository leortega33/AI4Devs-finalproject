import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { ExerciseCatalogPage } from './ExerciseCatalogPage';
import { exerciseService } from '../services/exerciseService';

vi.mock('../services/exerciseService', () => ({
  exerciseService: { list: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ExerciseCatalogPage />
    </MemoryRouter>,
  );
}

describe('ExerciseCatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
    vi.mocked(exerciseService.list).mockResolvedValue([
      { id: 1, name: 'Back squat', muscleGroup: 'Legs', category: 'main' },
    ] as never);
  });

  it('should list the exercises', async () => {
    renderPage();

    expect(await screen.findByText('Back squat')).toBeInTheDocument();
  });

  it('should filter by category', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Back squat');

    await user.click(screen.getByRole('combobox', { name: /categoría/i }));
    await user.click(await screen.findByRole('option', { name: 'Principal' }));

    await waitFor(() =>
      expect(exerciseService.list).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'main' }),
      ),
    );
  });

  it('should navigate to the new exercise form', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Back squat');

    await user.click(screen.getByRole('button', { name: /nuevo ejercicio/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/exercises/new');
  });

  it('should render the row edit action as an icon-only button that navigates', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Back squat');

    const edit = screen.getByRole('button', { name: 'Editar' });
    expect(edit).toHaveTextContent('');

    await user.click(edit);
    expect(mockNavigate).toHaveBeenCalledWith('/exercises/1/edit');
  });
});
