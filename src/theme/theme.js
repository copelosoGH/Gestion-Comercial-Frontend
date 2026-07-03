import { createTheme } from '@mui/material/styles';
import { esES } from '@mui/material/locale';

/**
 * Tema de la app. Verde como color de marca (coherente con la app original).
 * Se pasa el locale esES para que los componentes de MUI vengan en español.
 */
const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: { main: '#16a34a', dark: '#15803d', light: '#22c55e', contrastText: '#fff' },
      secondary: { main: '#0e7490' },
      background: { default: '#f4f6f8', paper: '#ffffff' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'Roboto, system-ui, Arial, sans-serif',
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiAppBar: { styleOverrides: { root: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } } },
    },
  },
  esES,
);

export default theme;
