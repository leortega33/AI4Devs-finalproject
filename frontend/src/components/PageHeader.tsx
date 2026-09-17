import { type ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { BackButton } from './BackButton';

interface PageHeaderProps {
  title: string;
  /** Right-aligned actions (buttons, etc.). */
  actions?: ReactNode;
  /** When set, shows a back control navigating to this route. */
  backTo?: string;
}

/** Consistent page header: optional back control, title, and right-aligned actions. */
export function PageHeader({ title, actions, backTo }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      {backTo && <BackButton to={backTo} />}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Typography variant="h4">{title}</Typography>
        {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
      </Stack>
    </Box>
  );
}
