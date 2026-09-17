import { createTheme } from '@mui/material/styles';
// Type augmentation so `MuiDataGrid` is allowed in theme `components`.
import type {} from '@mui/x-data-grid/themeAugmentation';

// Brand palette derived from the gym's training-plan PDF: black + leaf green + white.
// Tokens are structured so a future dark mode only needs a second palette (US-012).
const LEAF_GREEN = '#2E7D32';
const LEAF_GREEN_LIGHT = '#43A047';
const LEAF_GREEN_DARK = '#1B5E20';
const NEAR_BLACK = '#1B1B1B';

export const theme = createTheme({
  palette: {
    primary: { main: LEAF_GREEN, light: LEAF_GREEN_LIGHT, dark: LEAF_GREEN_DARK, contrastText: '#FFFFFF' },
    secondary: { main: NEAR_BLACK, contrastText: '#FFFFFF' },
    success: { main: LEAF_GREEN },
    background: { default: '#F4F6F5', paper: '#FFFFFF' },
    text: { primary: '#1B1B1B', secondary: '#5A6360' },
    divider: 'rgba(27, 27, 27, 0.10)',
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 12,
        }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 12,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.background.default,
            fontWeight: 700,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.06)',
          },
        }),
      },
    },
  },
});
