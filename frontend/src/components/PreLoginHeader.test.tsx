import { render, screen } from '@testing-library/react';
import i18n from '../i18n';
import { PreLoginHeader } from './PreLoginHeader';

describe('PreLoginHeader', () => {
  beforeEach(() => i18n.changeLanguage('es'));

  it('should render the brand name, tagline and logo', () => {
    render(<PreLoginHeader />);

    expect(screen.getByRole('heading', { name: 'SPORT – FITNESS' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /logo/i })).toBeInTheDocument();
    expect(screen.getByText(/entrenamiento/i)).toBeInTheDocument();
  });
});
