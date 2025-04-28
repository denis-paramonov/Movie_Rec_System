import React, { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { ThemeContext } from './App';

function ThemeToggle() {
  const { mode, toggleTheme } = useContext(ThemeContext);

  return (
    <Tooltip title="Сменить тему">
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          transition: 'transform 0.5s ease, color 0.3s ease',
          '&:hover': {
            transform: 'rotate(360deg)',
            color: mode === 'light' ? 'yellow' : 'cyan',
            scale: 1.2,
          },
        }}
      >
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;
