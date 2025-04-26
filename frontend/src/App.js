import React, { useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import Login from './Login';
import Recommendations from './Recommendations';
import History from './History';
import Profile from './Profile';
import Search from './Search';

export const ThemeContext = createContext();

// Создаём экземпляр QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Количество попыток при ошибке
      staleTime: 5 * 60 * 1000, // Данные считаются свежими 5 минут
    },
  },
});

function App() {
  const [mode, setMode] = useState('light');

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#3b82f6',
      },
      background: {
        default: mode === 'light' ? '#e8f0fe' : '#1a202c',
        paper: mode === 'light' ? '#ffffff' : '#2d3748',
      },
      text: {
        primary: mode === 'light' ? '#000000' : '#ffffff',
        secondary: mode === 'light' ? '#555555' : '#b0b0b0',
      },
      cardBorder: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  });

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <QueryClientProvider client={queryClient}> {/* Оборачиваем приложение в QueryClientProvider */}
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/recommend" element={<Recommendations />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/" element={<Login />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
}

export default App;