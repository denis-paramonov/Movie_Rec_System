import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Recommendations from './Recommendations';
import History from './History';
import Login from './Login'; // Предполагаемый компонент логина
import ThemeToggle from './ThemeToggle';

export const ThemeContext = React.createContext();

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                background: {
                  default: '#f5f5f5',
                  paper: '#ffffff',
                },
                text: {
                  primary: '#333333',
                  secondary: '#666666',
                },
                primary: {
                  main: '#1976d2', // Синий акцент
                },
                secondary: {
                  main: '#ff9800', // Оранжевый для кнопок
                },
                cardBorder: '#e0e0e0', // Рамка для светлой темы
              }
            : {
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
                text: {
                  primary: '#e0e0e0',
                  secondary: '#b0b0b0',
                },
                primary: {
                  main: '#90caf9', // Светло-синий для тёмной
                },
                secondary: {
                  main: '#ffb300', // Яркий оранжевый
                },
                cardBorder: '#424242', // Рамка для тёмной темы
              }),
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 500,
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                transition: 'all 0.3s ease',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                padding: '8px 16px',
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/recommend" element={<Recommendations />} />
            <Route path="/history" element={<History />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Recommendations />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
