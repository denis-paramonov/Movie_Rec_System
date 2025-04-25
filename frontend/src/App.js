import React, { createContext, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { motion } from 'framer-motion';
import Login from './Login';
import History from './History';
import Recommendations from './Recommendations';
import Profile from './Profile';
import { QueryClient, QueryClientProvider } from 'react-query';
import theme from './theme';

export const ThemeContext = createContext();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [mode, setMode] = useState('light');

  const muiTheme = useMemo(
    () =>
      createTheme({
        ...theme,
        palette: {
          ...theme.palette,
          mode,
          background: {
            default: mode === 'light' ? '#fff' : '#121212',
            paper: mode === 'light' ? '#fff' : '#1e1e1e',
          },
          cardBorder: mode === 'light' ? '#e0e0e0' : '#424242',
          text: {
            primary: mode === 'light' ? '#333' : '#fff',
            secondary: mode === 'light' ? '#666' : '#bbb',
          },
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const themeContextValue = { toggleTheme, mode };

  const backgroundVariants = {
    light: { backgroundColor: '#fff' },
    dark: { backgroundColor: '#121212' },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={themeContextValue}>
        <ThemeProvider theme={muiTheme}>
          <motion.div
            animate={mode === 'light' ? 'light' : 'dark'}
            variants={backgroundVariants}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ minHeight: '100vh' }}
          >
            <CssBaseline />
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/history" element={<History />} />
                <Route path="/recommend" element={<Recommendations />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </motion.div>
        </ThemeProvider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}

export default App;