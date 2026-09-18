import { useState } from 'react';
import { AppBar, Box, Button, Drawer, IconButton, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { Sidebar } from './Sidebar';

const DRAWER_WIDTH = 240;

/** Shared shell for authenticated screens: branded AppBar + sidebar nav + content. */
export function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: { xs: 0.5, sm: 1 } }}>
          {!isDesktop && (
            <IconButton edge="start" aria-label={t('common.menu')} onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Box
            component="button"
            onClick={() => navigate('/')}
            aria-label={t('common.home')}
            sx={{ background: 'none', border: 0, p: 0, cursor: 'pointer', display: 'flex' }}
          >
            <BrandLogo size={40} hideNameOnMobile />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <LanguageSwitcher />
          <NotificationBell />
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={() => logout()}
            aria-label={t('common.logout')}
            sx={{ minWidth: { xs: 'auto', sm: 64 }, px: { xs: 1, sm: 2 }, '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } } }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {t('common.logout')}
            </Box>
          </Button>
        </Toolbar>
      </AppBar>

      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          <Sidebar offsetToolbar />
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{ ml: { md: `${DRAWER_WIDTH}px` }, px: { xs: 2, sm: 3 }, py: 4, mt: '64px' }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
