import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  beforeEach(() => i18n.changeLanguage('es'));

  it('should switch the app language to English', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole('combobox', { name: /idioma/i }));
    await user.click(await screen.findByRole('option', { name: /ingl\u00e9s/i }));

    expect(i18n.language).toBe('en');
  });

  it('should render no raw translation keys', () => {
    render(<LanguageSwitcher />);

    // A raw key would look like "common.language"; ensure it is not rendered.
    expect(screen.queryByText(/common\./)).not.toBeInTheDocument();
  });
});
