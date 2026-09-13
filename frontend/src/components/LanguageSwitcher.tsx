import { MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Language selector shown on authenticated screens (see US-010). */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage ?? 'es';

  return (
    <TextField
      select
      size="small"
      label={t('common.language')}
      value={current}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      sx={{ minWidth: 120 }}
    >
      <MenuItem value="es">{t('common.spanish')}</MenuItem>
      <MenuItem value="en">{t('common.english')}</MenuItem>
    </TextField>
  );
}
