import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '../i18n';
import { BackButton } from './BackButton';

describe('BackButton', () => {
  beforeEach(() => i18n.changeLanguage('es'));

  it('should navigate to the explicit destination when "to" is provided', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/clients/new']}>
        <Routes>
          <Route path="/clients" element={<div>Clients list</div>} />
          <Route path="/clients/new" element={<BackButton to="/clients" />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /atrás/i }));

    expect(screen.getByText('Clients list')).toBeInTheDocument();
  });
});
