import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  /** Explicit destination. Defaults to the previous history entry. */
  to?: string;
}

/** Consistent "back" navigation control for inner screens. */
export function BackButton({ to }: BackButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Button
      color="inherit"
      startIcon={<ArrowBackIcon />}
      onClick={() => (to ? navigate(to) : navigate(-1))}
      sx={{ mb: 2 }}
    >
      {t('common.back')}
    </Button>
  );
}
