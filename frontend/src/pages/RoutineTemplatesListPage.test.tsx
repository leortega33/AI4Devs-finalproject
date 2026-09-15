import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { RoutineTemplatesListPage } from './RoutineTemplatesListPage';
import { routineTemplateService } from '../services/routineTemplateService';

vi.mock('../services/routineTemplateService', () => ({
  routineTemplateService: { list: vi.fn(), duplicate: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <RoutineTemplatesListPage />
    </MemoryRouter>,
  );
}

describe('RoutineTemplatesListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
    vi.mocked(routineTemplateService.list).mockResolvedValue([
      { id: 1, name: 'Hipertrofia', objective: 'Fuerza', status: 'draft', sessionCount: 2 },
    ] as never);
  });

  it('should list the templates', async () => {
    renderPage();

    expect(await screen.findByText('Hipertrofia')).toBeInTheDocument();
  });

  it('should duplicate a template and reload', async () => {
    vi.mocked(routineTemplateService.duplicate).mockResolvedValue({} as never);
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Hipertrofia');

    await user.click(screen.getByRole('button', { name: /duplicar/i }));

    await waitFor(() => expect(routineTemplateService.duplicate).toHaveBeenCalledWith(1));
    expect(routineTemplateService.list).toHaveBeenCalledTimes(2);
  });

  it('should navigate to the new routine builder', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Hipertrofia');

    await user.click(screen.getByRole('button', { name: /nueva rutina/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/routines/new');
  });
});
