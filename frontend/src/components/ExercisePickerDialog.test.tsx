import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../i18n';
import { ExercisePickerDialog } from './ExercisePickerDialog';
import { exerciseService } from '../services/exerciseService';

vi.mock('../services/exerciseService', () => ({
  exerciseService: { list: vi.fn() },
}));

describe('ExercisePickerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
    vi.mocked(exerciseService.list).mockResolvedValue([
      { id: 7, name: 'Sentadilla', muscleGroup: 'Piernas', category: 'main' },
    ] as never);
  });

  it('should list exercises and return the chosen one', async () => {
    const onChoose = vi.fn();
    const user = userEvent.setup();
    render(<ExercisePickerDialog open onCancel={vi.fn()} onChoose={onChoose} />);

    await user.click(await screen.findByText('Sentadilla'));

    expect(onChoose).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, name: 'Sentadilla' }),
    );
  });

  it('should filter by category', async () => {
    const user = userEvent.setup();
    render(<ExercisePickerDialog open onCancel={vi.fn()} onChoose={vi.fn()} />);
    await screen.findByText('Sentadilla');

    await user.click(screen.getByRole('combobox', { name: /categoría/i }));
    await user.click(await screen.findByRole('option', { name: 'Principal' }));

    await waitFor(() =>
      expect(exerciseService.list).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'main' }),
      ),
    );
  });
});
