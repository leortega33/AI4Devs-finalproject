import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.png';

interface BrandLogoProps {
  /** Logo height in px. */
  size?: number;
  /** Render the brand name next to the logo. */
  showName?: boolean;
  /** Hide the brand name on extra-small screens (kept in the DOM for a11y/tests). */
  hideNameOnMobile?: boolean;
  color?: 'inherit' | 'primary';
}

/** Gym brand: bear logo + name. Falls back to text if the image fails to load. */
export function BrandLogo({ size = 36, showName = true, hideNameOnMobile = false, color = 'inherit' }: BrandLogoProps) {
  const { t } = useTranslation();
  const [imageOk, setImageOk] = useState(true);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {imageOk && (
        <Box
          component="img"
          src={logo}
          alt={t('common.logoAlt')}
          onError={() => setImageOk(false)}
          sx={{ height: size, width: 'auto' }}
        />
      )}
      {showName && (
        <Typography
          variant="h6"
          component="span"
          sx={{
            fontWeight: 800,
            color,
            letterSpacing: 0.5,
            whiteSpace: 'nowrap',
            display: hideNameOnMobile ? { xs: 'none', sm: 'inline' } : 'inline',
          }}
        >
          {t('common.appName')}
        </Typography>
      )}
    </Box>
  );
}
