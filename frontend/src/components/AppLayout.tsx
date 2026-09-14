import { AppBar, Box, Button, Container, Toolbar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';

/** Shared shell for authenticated screens: branded AppBar + page content. */
export function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 2 }}>
          <Box
            component="button"
            onClick={() => navigate('/')}
            aria-label={t('common.home')}
            sx={{ background: 'none', border: 0, p: 0, cursor: 'pointer', display: 'flex' }}
          >
            <BrandLogo size={40} />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <LanguageSwitcher />
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={() => logout()}
            aria-label={t('common.logout')}
          >
            {t('common.logout')}
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
