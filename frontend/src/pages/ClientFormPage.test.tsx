import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ClientFormPage } from './ClientFormPage';
import { clientService } from '../services/clientService';

vi.mock('../services/clientService', () => ({
  clientService: { get: vi.fn(), create: vi.fn(), update: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({}) };
});

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/nombre/i), 'John');
  await user.type(screen.getByLabelText(/apellido/i), 'Doe');
  await user.type(screen.getByLabelText(/dni/i), '12345678');
  await user.type(screen.getByLabelText(/^teléfono(?! de)/i), '+542604000000');
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  await user.type(screen.getByLabelText(/fecha de nacimiento/i), '1990-01-01');
}

describe('ClientFormPage (create)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should show a validation error when required fields are missing', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ClientFormPage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText(/completá todos los campos obligatorios/i)).toBeInTheDocument();
    expect(clientService.create).not.toHaveBeenCalled();
  });

  it('should reject an invalid DNI', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ClientFormPage /></MemoryRouter>);

    await user.type(screen.getByLabelText(/nombre/i), 'John');
    await user.type(screen.getByLabelText(/apellido/i), 'Doe');
    await user.type(screen.getByLabelText(/dni/i), 'abc');
    await user.type(screen.getByLabelText(/^teléfono(?! de)/i), '+54');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/fecha de nacimiento/i), '1990-01-01');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText(/dni debe tener 7 u 8 dígitos/i)).toBeInTheDocument();
  });

  it('should create a client and navigate to the list', async () => {
    vi.mocked(clientService.create).mockResolvedValue({} as never);
    const user = userEvent.setup();
    render(<MemoryRouter><ClientFormPage /></MemoryRouter>);

    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/clients'));
    expect(clientService.create).toHaveBeenCalled();
  });

  it('should show a DNI conflict error from the API', async () => {
    vi.mocked(clientService.create).mockRejectedValue({ response: { status: 409 } });
    const user = userEvent.setup();
    render(<MemoryRouter><ClientFormPage /></MemoryRouter>);

    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText(/ya existe un cliente con este dni/i)).toBeInTheDocument();
  });
});
