import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { MedicalRecordPage } from './MedicalRecordPage';
import { clientService } from '../services/clientService';
import { medicalRecordService } from '../services/medicalRecordService';

vi.mock('../services/clientService', () => ({
  clientService: { get: vi.fn() },
}));

vi.mock('../services/medicalRecordService', () => ({
  medicalRecordService: { get: vi.fn(), save: vi.fn(), getHistory: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ clientId: '10' }) };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <MedicalRecordPage />
    </MemoryRouter>,
  );
}

describe('MedicalRecordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('es');
    vi.mocked(clientService.get).mockResolvedValue({
      id: 10,
      firstName: 'John',
      lastName: 'Doe',
    } as never);
    vi.mocked(medicalRecordService.getHistory).mockResolvedValue([]);
  });

  it('should show the empty state when the client has no record yet', async () => {
    vi.mocked(medicalRecordService.get).mockResolvedValue(null);

    renderPage();

    expect(await screen.findByText(/todavía no tiene ficha médica/i)).toBeInTheDocument();
  });

  it('should load and display an existing record without the empty state', async () => {
    vi.mocked(medicalRecordService.get).mockResolvedValue({
      id: 1,
      clientId: 10,
      bloodType: 'O+',
      injuries: 'Knee',
    } as never);

    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText(/grupo sanguíneo/i)).toHaveValue('O+'),
    );
    expect(screen.queryByText(/todavía no tiene ficha médica/i)).not.toBeInTheDocument();
  });

  it('should save the medical record', async () => {
    vi.mocked(medicalRecordService.get).mockResolvedValue(null);
    vi.mocked(medicalRecordService.save).mockResolvedValue({} as never);
    const user = userEvent.setup();

    renderPage();

    await screen.findByText(/todavía no tiene ficha médica/i);
    await user.type(screen.getByLabelText(/alergias/i), 'Penicillin');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(medicalRecordService.save).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ allergies: 'Penicillin' }),
      ),
    );
  });

  it('should show the empty history state when there are no versions', async () => {
    vi.mocked(medicalRecordService.get).mockResolvedValue(null);
    vi.mocked(medicalRecordService.getHistory).mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText('Historial de cambios')).toBeInTheDocument();
    expect(screen.getByText(/todavía no hay versiones guardadas/i)).toBeInTheDocument();
  });

  it('should list the saved versions newest first with their values', async () => {
    vi.mocked(medicalRecordService.get).mockResolvedValue(null);
    vi.mocked(medicalRecordService.getHistory).mockResolvedValue([
      {
        id: 2,
        clientId: 10,
        injuries: 'Shoulder',
        createdAt: '2026-02-01T10:00:00.000Z',
      },
      {
        id: 1,
        clientId: 10,
        injuries: 'Knee',
        createdAt: '2026-01-01T10:00:00.000Z',
      },
    ] as never);

    renderPage();

    expect(await screen.findByText(/Lesiones: Shoulder/)).toBeInTheDocument();
    expect(screen.getByText(/Lesiones: Knee/)).toBeInTheDocument();
  });
});
