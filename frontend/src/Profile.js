import React, { useState, useContext, useMemo } from 'react';
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  AppBar,
  Toolbar,
  Box,
  Tabs,
  Tab,
  TextField,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Movie,
  History,
  Person,
  Logout,
  Lock,
  Search as SearchIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useQuery } from 'react-query';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { ThemeContext } from './App';

// Улучшенная цветовая палитра
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#22d3ee', '#a3e635', '#f87171', '#34d399', '#a78bfa', '#9ca3af', '#fb923c'];

const weekdayNames = {
  Monday: 'Понедельник',
  Tuesday: 'Вторник',
  Wednesday: 'Среда',
  Thursday: 'Четверг',
  Friday: 'Пятница',
  Saturday: 'Суббота',
  Sunday: 'Воскресенье',
};

function Profile() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');
  const navigate = useNavigate();
  const { mode } = useContext(ThemeContext);

  // Запрос данных профиля
  const { data: profileData, isLoading: profileLoading } = useQuery(
    ['profile', userId],
    async () => {
      const response = await axios.get(`http://localhost:5001/profile?user_id=${userId}`);
      return response.data;
    },
    { enabled: !!userId }
  );

  // Состояние для диалога смены пароля
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Обработчик смены пароля
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5001/change_password', {
        user_id: userId,
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess(response.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setOpenPasswordDialog(false), 1500);
    } catch (error) {
      setPasswordError(error.response?.data?.error || 'Ошибка смены пароля');
    }
  };

  // Состояние для вкладок аналитики
  const [analyticsTab, setAnalyticsTab] = useState('genres');

  // Запрос данных аналитики
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    ['analytics', userId],
    async () => {
      const response = await axios.get(`http://localhost:5001/analytics?user_id=${userId}`);
      return response.data;
    },
    { enabled: !!userId }
  );

  // Обработчик выхода
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  // Анимации для графиков
  const chartVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  // Анимация для элементов графика
  const cellVariants = {
    hover: { scale: 1.1, transition: { duration: 0.3 } },
    initial: { scale: 1 },
  };

  // Кэширование данных графика для предотвращения мигания
  const weekdayData = useMemo(() => {
    return analyticsData?.weekday_views?.map(item => ({
      ...item,
      weekday: weekdayNames[item.weekday] || item.weekday,
      durationHours: (item.duration / 3600).toFixed(1),
      durationFormatted: `${Math.floor(item.duration / 3600)}ч ${Math.floor((item.duration % 3600) / 60)}м`,
    })) || [];
  }, [analyticsData]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: mode === 'light'
          ? 'linear-gradient(to bottom, #e8f0fe, #d0e7ff)'
          : 'linear-gradient(to bottom, #1a202c, #2d3748)',
      }}
    >
      <AppBar position="sticky">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Профиль
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Поиск">
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                color="inherit"
                onClick={() => navigate(`/search?user_id=${userId}`)}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Рекомендации">
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                color="inherit"
                onClick={() => navigate(`/recommend?user_id=${userId}`)}
              >
                <Movie />
              </IconButton>
            </Tooltip>
            <Tooltip title="История">
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                color="inherit"
                onClick={() => navigate(`/history?user_id=${userId}`)}
              >
                <History />
              </IconButton>
            </Tooltip>
            <Tooltip title="Профиль">
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                color="inherit"
                onClick={() => navigate(`/profile?user_id=${userId}`)}
              >
                <Person />
              </IconButton>
            </Tooltip>
            <ThemeToggle />
            <Tooltip title="Выйти">
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                color="inherit"
                onClick={handleLogout}
              >
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, p: 4 }}>
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            background: (theme) => theme.palette.background.paper,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            mb: 4,
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#3b82f6' }}>
            Профиль пользователя
          </Typography>
          {profileLoading ? (
            <CircularProgress />
          ) : (
            <Typography variant="h6" sx={{ color: mode === 'light' ? '#1f2937' : '#d1d5db' }}>
              Логин: {profileData?.username || 'Неизвестный'}
            </Typography>
          )}
          <Button
            variant="contained"
            sx={{
              mt: 2,
              background: 'linear-gradient(45deg, #3b82f6 30%, #5c9cea 90%)',
              boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5c9cea 30%, #3b82f6 90%)',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
              },
            }}
            startIcon={<Lock />}
            onClick={() => setOpenPasswordDialog(true)}
            component={motion.button}
            whileTap={{ scale: 0.95 }}
          >
            Изменить пароль
          </Button>
        </Box>
        <Dialog
          open={openPasswordDialog}
          onClose={() => setOpenPasswordDialog(false)}
          TransitionComponent={motion.div}
          TransitionProps={{
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.9 },
            transition: { duration: 0.3, ease: 'easeInOut' },
          }}
        >
          <DialogTitle sx={{ bgcolor: '#3b82f6', color: 'white' }}>Смена пароля</DialogTitle>
          <DialogContent>
            {passwordError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {passwordError}
              </Typography>
            )}
            {passwordSuccess && (
              <Typography color="green" sx={{ mb: 2 }}>
                {passwordSuccess}
              </Typography>
            )}
            <TextField
              label="Текущий пароль"
              type="password"
              fullWidth
              margin="normal"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#3b82f6' },
                  '&:hover fieldset': { borderColor: '#60a5fa' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: '#3b82f6' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
              }}
            />
            <TextField
              label="Новый пароль"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#3b82f6' },
                  '&:hover fieldset': { borderColor: '#60a5fa' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: '#3b82f6' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
              }}
            />
            <TextField
              label="Подтвердите новый пароль"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#3b82f6' },
                  '&:hover fieldset': { borderColor: '#60a5fa' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: '#3b82f6' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPasswordDialog(false)}>Отмена</Button>
            <Button
              onClick={handleChangePassword}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #3b82f6 30%, #60a5fa 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #60a5fa 30%, #3b82f6 90%)',
                },
              }}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            background: (theme) => theme.palette.background.paper,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#3b82f6' }}>
            Аналитика просмотров
          </Typography>
          <Tabs
            value={analyticsTab}
            onChange={(e, newValue) => setAnalyticsTab(newValue)}
            sx={{
              mb: 4,
              '.MuiTab-root': {
                color: mode === 'light' ? '#3b82f6' : '#60a5fa',
                '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
              },
              '.Mui-selected': {
                color: '#ffffff !important',
                backgroundColor: '#3b82f6',
                borderRadius: 2,
              },
              '.MuiTabs-indicator': {
                display: 'none', // Убираем синюю полоску
              },
            }}
          >
            <Tab label="Жанры" value="genres" />
            <Tab label="Страны" value="countries" />
            <Tab label="Дни недели" value="weekday_views" />
            <Tab label="Топ актёров" value="top_actors" />
          </Tabs>
          {analyticsLoading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto' }} />
          ) : (
            <Box
              component={motion.div}
              variants={chartVariants}
              initial="hidden"
              animate="visible"
            >
              {analyticsTab === 'genres' && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#1f2937', fontWeight: 'medium' }}>
                    Распределение просмотров по жанрам
                  </Typography>
                  <ResponsiveContainer width="100%" height={500}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.genres || []}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={180}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {(analyticsData?.genres || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            as={motion.path}
                            variants={cellVariants}
                            whileHover="hover"
                            initial="initial"
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          background: mode === 'light' ? '#ffffff' : '#2d3748',
                          borderRadius: 8,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
              {analyticsTab === 'countries' && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#1f2937', fontWeight: 'medium' }}>
                    Распределение просмотров по странам
                  </Typography>
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={analyticsData?.countries || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke={mode === 'light' ? '#e5e7eb' : '#4b5563'} />
                      <XAxis dataKey="name" tick={{ fill: mode === 'light' ? '#1f2937' : '#d1d5db' }} />
                      <YAxis tick={{ fill: mode === 'light' ? '#1f2937' : '#d1d5db' }} />
                      <RechartsTooltip
                        contentStyle={{
                          background: mode === 'light' ? '#ffffff' : '#2d3748',
                          borderRadius: 8,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        }}
                      />
                      <Bar
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {(analyticsData?.countries || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            as={motion.rect}
                            variants={cellVariants}
                            whileHover="hover"
                            initial="initial"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
              {analyticsTab === 'weekday_views' && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#1f2937', fontWeight: 'medium' }}>
                    Время просмотра по дням недели (в часах)
                  </Typography>
                  <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={weekdayData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={mode === 'light' ? '#e5e7eb' : '#4b5563'} />
                      <XAxis
                        dataKey="weekday"
                        tick={{ fill: mode === 'light' ? '#1f2937' : '#d1d5db' }}
                      />
                      <YAxis
                        label={{
                          value: 'Часы',
                          angle: -90,
                          position: 'insideLeft',
                          offset: 10,
                          fill: mode === 'light' ? '#1f2937' : '#d1d5db',
                        }}
                        dataKey="durationHours"
                        tick={{ fill: mode === 'light' ? '#1f2937' : '#d1d5db' }}
                      />
                      <RechartsTooltip
                        formatter={(value, name, props) => props.payload.durationFormatted}
                        contentStyle={{
                          background: mode === 'light' ? '#ffffff' : '#2d3748',
                          borderRadius: 8,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="durationHours"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                        animationBegin={0}
                        animationDuration={1000}
                        as={motion.path}
                        variants={cellVariants}
                        whileHover="hover"
                        initial="initial"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
              {analyticsTab === 'top_actors' && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#1f2937', fontWeight: 'medium' }}>
                    Актёры, которые встречались в фильмах, которые вы смотрели
                  </Typography>
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                      data={analyticsData?.top_actors || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={mode === 'light' ? '#e5e7eb' : '#4b5563'} />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fill: mode === 'light' ? '#1f2937' : '#d1d5db' }}
                      />
                      <YAxis tick={{ fill: mode === 'light' ? '#1f2937' : '#d1d5db' }} />
                      <RechartsTooltip
                        contentStyle={{
                          background: mode === 'light' ? '#ffffff' : '#2d3748',
                          borderRadius: 8,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        }}
                      />
                      <Bar
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {(analyticsData?.top_actors || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            as={motion.rect}
                            variants={cellVariants}
                            whileHover="hover"
                            initial="initial"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default Profile;