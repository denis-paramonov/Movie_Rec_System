import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#f97316',
      contrastText: '#fff',
    },
    secondary: {
      main: '#fb923c',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
    text: {
      primary: '#333',
      secondary: '#666',
    },
    cardBorder: '#e0e0e0',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;