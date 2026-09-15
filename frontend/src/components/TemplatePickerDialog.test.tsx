import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../i18n';
import { TemplatePickerDialog } from './TemplatePickerDialog';
import { routineTemplateService } from '../services/routineTemplateService';

vi.mock('../services/routineTemplateService', () => ({
  routineTemplateService: { list: vi.fn() },
}));

describe('TemplatePickerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
  });

  it('should list templates and return the chosen one', async () => {
    vi.mocked(routineTemplateService.list).mockResolvedValue([
      { id: 1, name: 'Hipertrofia', objective: 'Fuerza', status: 'draft', sessionCount: 2 },
    ] as never);
    const onChoose = vi.fn();
    const user = userEvent.setup();
    render(<TemplatePickerDialog open onCancel={vi.fn()} onChoose={onChoose} />);

    await user.click(await screen.findByText('Hipertrofia'));

    expect(onChoose).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'Hipertrofia' }));
  });

  it('should show an empty state when there are no templates', async () => {
    vi.mocked(routineTemplateService.list).mockResolvedValue([] as never);
    render(<TemplatePickerDialog open onCancel={vi.fn()} onChoose={vi.fn()} />);

    expect(await screen.findByText(/no hay plantillas de biblioteca/i)).toBeInTheDocument();
  });
});
