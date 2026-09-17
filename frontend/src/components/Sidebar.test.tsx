import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { Sidebar } from './Sidebar';

function renderSidebar(initialPath = '/clients') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar />
    </MemoryRouter>,
  );
}

describe('Sidebar', () => {
  beforeEach(() => i18n.changeLanguage('es'));

  it('renders the navigation links', () => {
    renderSidebar();

    expect(screen.getByRole('link', { name: 'Panel' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Clientes' })).toHaveAttribute('href', '/clients');
    expect(screen.getByRole('link', { name: 'Ejercicios' })).toHaveAttribute('href', '/exercises');
    expect(screen.getByRole('link', { name: 'Rutinas' })).toHaveAttribute('href', '/routines');
  });

  it('marks the active route with aria-current', () => {
    renderSidebar('/clients');

    expect(screen.getByRole('link', { name: 'Clientes' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Panel' })).not.toHaveAttribute('aria-current', 'page');
  });
});
