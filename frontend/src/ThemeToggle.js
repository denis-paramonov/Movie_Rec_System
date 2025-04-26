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
    setTimeout(() => setIsSwitching(false), 600); // Анимация длится 0.6 секунды
  };

  const iconVariants = {
    initial: { scale: 1, opacity: 1 },
    switching: {
      scale: [1, 1.3, 1], // Масштабирование: увеличение и возврат
      opacity: [1, 0.5, 1], // Лёгкое затухание и возврат
      color: mode === 'light' ? ['#3b82f6', '#a78bfa', '#3b82f6'] : ['#a78bfa', '#3b82f6', '#a78bfa'], // Переход цвета
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
      },
    },
    hover: {
      scale: 1.1,
      rotate: 10, // Небольшой поворот при наведении
      transition: { duration: 0.3 },
    },
  };

  return (
    <Tooltip title={mode === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
      <IconButton
        component={motion.button}
        variants={iconVariants}
        initial="initial"
        animate={isSwitching ? 'switching' : 'initial'}
        whileHover="hover"
        onClick={handleToggle}
        color="inherit"
        sx={sx}
      >
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;