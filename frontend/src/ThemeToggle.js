import React, { useContext, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ThemeContext } from './App';

function ThemeToggle({ sx }) {
  const { toggleTheme, mode } = useContext(ThemeContext);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleToggle = () => {
    setIsSwitching(true);
    toggleTheme();
    setTimeout(() => setIsSwitching(false), 500); // Анимация длится 0.5 секунды
  };

  const iconVariants = {
    light: { rotate: 360 },
    dark: { rotate: 0 },
    switching: {
      rotate: [0, 360],
      transition: { duration: 0.5, repeat: 1 },
    },
  };

  return (
    <Tooltip title={mode === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
      <IconButton
        component={motion.button}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggle}
        color="inherit"
        sx={sx}
      >
        <motion.div
          animate={isSwitching ? 'switching' : mode === 'light' ? 'light' : 'dark'}
          variants={iconVariants}
        >
          {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
        </motion.div>
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;