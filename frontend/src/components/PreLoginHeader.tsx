import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';

/** Branded header for public (pre-login) pages: login / forgot / reset. */
export function PreLoginHeader() {
  const { t } = useTranslation();

  return (
    <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
      <Box sx={{ alignSelf: 'flex-end' }}>
        <LanguageSwitcher />
      </Box>
      <BrandLogo size={72} showName={false} />
      <Typography variant="h5" component="h1" sx={{ fontWeight: 800 }}>
        {t('common.appName')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('common.appTagline')}
      </Typography>
    </Stack>
  );
}
