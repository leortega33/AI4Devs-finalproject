import { Link as RouterLink, useLocation } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  /** Called when a link is selected (used to close the mobile drawer). */
  onNavigate?: () => void;
  /** Reserve space for the fixed AppBar (permanent drawer only). */
  offsetToolbar?: boolean;
}

/** Navigation sidebar for authenticated screens (US-012). */
export function Sidebar({ onNavigate, offsetToolbar = false }: SidebarProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const items = [
    { to: '/', label: t('nav.dashboard'), icon: <DashboardIcon /> },
    { to: '/clients', label: t('nav.clients'), icon: <PeopleIcon /> },
    { to: '/exercises', label: t('nav.exercises'), icon: <FitnessCenterIcon /> },
    { to: '/routines', label: t('nav.routines'), icon: <AssignmentIcon /> },
  ];

  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <nav aria-label={t('nav.dashboard')}>
      {offsetToolbar && <Toolbar />}
      <List sx={{ px: 1 }}>
        {items.map((item) => {
          const active = isActive(item.to);
          return (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={active}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 700 : 500 }} />
            </ListItemButton>
          );
        })}
      </List>
    </nav>
  );
}
