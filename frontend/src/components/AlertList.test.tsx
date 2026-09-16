import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { AlertList, type AlertItem } from './AlertList';

function renderList(items: AlertItem[]) {
  return render(
    <MemoryRouter>
      <AlertList title="Pagos vencidos" items={items} color="error" />
    </MemoryRouter>,
  );
}

describe('AlertList', () => {
  beforeEach(() => {
    i18n.changeLanguage('es');
  });

  it('shows the empty state when there are no items', () => {
    renderList([]);

    expect(screen.getByText('Sin alertas')).toBeInTheDocument();
  });

  it('renders each item as a link to its target', () => {
    renderList([
      { clientId: 7, clientName: 'Ana García', detail: 'Período 08/2026', to: '/clients/7/payments' },
    ]);

    const link = screen.getByRole('link', { name: /Ana García/ });
    expect(link).toHaveAttribute('href', '/clients/7/payments');
    expect(screen.getByText('Período 08/2026')).toBeInTheDocument();
  });
});
