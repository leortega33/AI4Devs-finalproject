import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface AlertItem {
  clientId: number;
  clientName: string;
  detail?: string;
  to: string;
}

interface AlertListProps {
  title: string;
  items: AlertItem[];
  color?: 'error' | 'warning' | 'info' | 'default';
}

/** Renders one dashboard alert group: a title with a count and a list of clients (see US-009). */
export function AlertList({ title, items, color = 'default' }: AlertListProps) {
  const { t } = useTranslation();

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <Chip label={items.length} color={color} size="small" />
      </Box>
      {items.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          {t('dashboard.empty')}
        </Typography>
      ) : (
        <List dense disablePadding>
          {items.map((item) => (
            <ListItemButton key={`${item.to}-${item.clientId}`} component={RouterLink} to={item.to}>
              <ListItemText primary={item.clientName} secondary={item.detail} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
}
