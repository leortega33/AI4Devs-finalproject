import { createTheme } from '@mui/material/styles';

// Brand palette derived from the gym's training-plan PDF: black + leaf green + white.
const LEAF_GREEN = '#2E7D32';
const LEAF_GREEN_LIGHT = '#43A047';
const NEAR_BLACK = '#1B1B1B';

export const theme = createTheme({
  palette: {
    primary: { main: LEAF_GREEN, light: LEAF_GREEN_LIGHT, contrastText: '#FFFFFF' },
    secondary: { main: NEAR_BLACK, contrastText: '#FFFFFF' },
    background: { default: '#F5F5F5', paper: '#FFFFFF' },
    text: { primary: '#1B1B1B', secondary: '#555555' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
});
