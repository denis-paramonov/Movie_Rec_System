import React, { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { ThemeContext } from './App';

function ThemeToggle() {
  const { toggleTheme, mode } = useContext(ThemeContext);

  return (
    <Tooltip title={mode === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}>
      <IconButton onClick={toggleTheme} color="inherit">
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;
