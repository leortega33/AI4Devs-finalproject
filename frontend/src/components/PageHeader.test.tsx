import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Button } from '@mui/material';
import i18n from '../i18n';
import { PageHeader } from './PageHeader';

function renderHeader(props: Parameters<typeof PageHeader>[0]) {
  return render(
    <MemoryRouter>
      <PageHeader {...props} />
    </MemoryRouter>,
  );
}

describe('PageHeader', () => {
  beforeEach(() => i18n.changeLanguage('es'));

  it('renders the title as a heading', () => {
    renderHeader({ title: 'Clientes' });

    expect(screen.getByRole('heading', { name: 'Clientes' })).toBeInTheDocument();
  });

  it('renders actions', () => {
    renderHeader({ title: 'Clientes', actions: <Button>Nuevo cliente</Button> });

    expect(screen.getByRole('button', { name: 'Nuevo cliente' })).toBeInTheDocument();
  });

  it('renders a back control when backTo is set', () => {
    renderHeader({ title: 'Pagos del cliente', backTo: '/clients' });

    expect(screen.getByRole('button', { name: /atrás/i })).toBeInTheDocument();
  });

  it('does not render a back control without backTo', () => {
    renderHeader({ title: 'Panel' });

    expect(screen.queryByRole('button', { name: /atrás/i })).not.toBeInTheDocument();
  });
});
