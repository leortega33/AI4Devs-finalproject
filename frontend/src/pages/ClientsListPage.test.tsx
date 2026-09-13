import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ClientsListPage } from './ClientsListPage';
import { clientService, type Client } from '../services/clientService';

vi.mock('../services/clientService', () => ({
  clientService: { list: vi.fn(), setStatus: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

const sample: Client = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  dni: '12345678',
  phone: '+542604000000',
  email: 'john@example.com',
  birthDate: '1990-01-01',
  status: 'active',
};

describe('ClientsListPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should load and render clients', async () => {
    vi.mocked(clientService.list).mockResolvedValue([sample]);

    render(<MemoryRouter><ClientsListPage /></MemoryRouter>);

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });

  it('should re-query with a status filter', async () => {
    vi.mocked(clientService.list).mockResolvedValue([sample]);
    const user = userEvent.setup();

    render(<MemoryRouter><ClientsListPage /></MemoryRouter>);
    await screen.findByText('John Doe');

    await user.click(screen.getByRole('combobox', { name: /status/i }));
    await user.click(await screen.findByRole('option', { name: /inactive/i }));

    await waitFor(() => expect(clientService.list).toHaveBeenLastCalledWith({ status: 'inactive' }));
  });
});
