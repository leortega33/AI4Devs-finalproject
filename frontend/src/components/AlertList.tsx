import { type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface AlertItem {
  clientId: number;
  clientName: string;
  detail?: string;
  to: string;
}

type AlertColor = 'error' | 'warning' | 'info' | 'success' | 'default';

interface AlertListProps {
  title: string;
  items: AlertItem[];
  color?: AlertColor;
  icon?: ReactNode;
}

const ACCENT: Record<AlertColor, string> = {
  error: 'error.main',
  warning: 'warning.main',
  info: 'info.main',
  success: 'success.main',
  default: 'text.secondary',
};

/** One dashboard alert group as a card: icon + count + a list of clients (US-009, US-012). */
export function AlertList({ title, items, color = 'default', icon }: AlertListProps) {
  const { t } = useTranslation();
  const accent = ACCENT[color];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          {icon && <Avatar sx={{ bgcolor: accent, width: 40, height: 40 }}>{icon}</Avatar>}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">{title}</Typography>
          </Box>
          <Typography variant="h4" sx={{ color: accent, fontWeight: 700, lineHeight: 1 }}>
            {items.length}
          </Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />
        {items.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            {t('dashboard.empty')}
          </Typography>
        ) : (
          <List dense disablePadding>
            {items.map((item) => (
              <ListItemButton
                key={`${item.to}-${item.clientId}`}
                component={RouterLink}
                to={item.to}
                sx={{ borderRadius: 1.5 }}
              >
                <ListItemText primary={item.clientName} secondary={item.detail} />
              </ListItemButton>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
