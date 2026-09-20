import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { ExerciseFormPage } from './ExerciseFormPage';
import { exerciseService } from '../services/exerciseService';

vi.mock('../services/exerciseService', () => ({
  exerciseService: { get: vi.fn(), create: vi.fn(), update: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({}) };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ExerciseFormPage />
    </MemoryRouter>,
  );
}

describe('ExerciseFormPage (create)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
  });

  it('should show a validation error when required fields are missing', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText(/completá nombre, grupo muscular y categoría/i)).toBeInTheDocument();
    expect(exerciseService.create).not.toHaveBeenCalled();
  });

  it('should create an exercise and navigate to the catalog', async () => {
    vi.mocked(exerciseService.create).mockResolvedValue({} as never);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/nombre/i), 'Front squat');
    await user.type(screen.getByLabelText(/grupo muscular/i), 'Legs');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(exerciseService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Front squat', muscleGroup: 'Legs', category: 'main' }),
      ),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/exercises');
  });

  it('should reject negative default sets or reps', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/nombre/i), 'Front squat');
    await user.type(screen.getByLabelText(/grupo muscular/i), 'Legs');
    await user.type(screen.getByLabelText(/series por defecto/i), '-2');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText(/no pueden ser negativas/i)).toBeInTheDocument();
    expect(exerciseService.create).not.toHaveBeenCalled();
  });

  it('should include the media URLs in the payload', async () => {
    vi.mocked(exerciseService.create).mockResolvedValue({} as never);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/nombre/i), 'Front squat');
    await user.type(screen.getByLabelText(/grupo muscular/i), 'Legs');
    await user.type(screen.getByLabelText(/url de video/i), 'https://youtu.be/x');
    await user.type(screen.getByLabelText(/url de imagen/i), 'https://example.com/x.png');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(exerciseService.create).toHaveBeenCalledWith(
        expect.objectContaining({ videoUrl: 'https://youtu.be/x', imageUrl: 'https://example.com/x.png' }),
      ),
    );
  });

  it('should include the selected body regions in the payload', async () => {
    vi.mocked(exerciseService.create).mockResolvedValue({} as never);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/nombre/i), 'Front squat');
    await user.type(screen.getByLabelText(/grupo muscular/i), 'Legs');
    await user.click(screen.getByLabelText(/zonas corporales/i));
    await user.click(await screen.findByRole('option', { name: 'Rodilla' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(exerciseService.create).toHaveBeenCalledWith(
        expect.objectContaining({ bodyRegions: ['knee'] }),
      ),
    );
  });
});
