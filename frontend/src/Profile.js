import React, { useState, useContext } from 'react';
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
  ResponsiveContainer,
} from 'recharts';
import { ThemeContext } from './App';

// Новая цветовая гамма (без оранжевого): оттенки синего, зелёного, фиолетового и серого
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#6b7280', '#22d3ee', '#a3e635', '#f87171', '#34d399', '#a78bfa', '#9ca3af'];

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

  const { data: profileData, isLoading: profileLoading } = useQuery(
    ['profile', userId],
    async () => {
      const response = await axios.get(`http://localhost:5001/profile?user_id=${userId}`);
      return response.data;
    },
    { enabled: !!userId }
  );

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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

  const [analyticsTab, setAnalyticsTab] = useState('genres');

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    ['analytics', userId],
    async () => {
      const response = await axios.get(`http://localhost:5001/analytics?user_id=${userId}`);
      return response.data;
    },
    { enabled: !!userId }
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  // Преобразование секунд в часы для графика
  const formatDurationToHours = (seconds) => {
    return (seconds / 3600).toFixed(1); // Часы с одним знаком после запятой
  };

  // Форматирование для тултипа (в часах и минутах)
  const formatDurationTooltip = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}ч ${minutes}м`;
  };

  // Данные для графика по дням недели
  const weekdayData = analyticsData?.weekday_views?.map(item => ({
    ...item,
    weekday: weekdayNames[item.weekday] || item.weekday,
    durationHours: formatDurationToHours(item.duration), // Для шкалы в часах
    durationFormatted: formatDurationTooltip(item.duration), // Для тултипа
  })) || [];

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
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            mb: 4,
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Профиль пользователя
          </Typography>
          {profileLoading ? (
            <CircularProgress />
          ) : (
            <Typography variant="h6">
              Логин: {profileData?.username || 'Неизвестный'}
            </Typography>
          )}
          <Button
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: '#3b82f6', // Используем синий из новой палитры
              '&:hover': {
                backgroundColor: '#60a5fa',
              },
            }}
            startIcon={<Lock />}
            onClick={() => setOpenPasswordDialog(true)}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
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
          <DialogTitle>Смена пароля</DialogTitle>
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
                  '& fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&:hover fieldset': {
                    borderColor: '#60a5fa',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#3b82f6',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#3b82f6',
                },
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
                  '& fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&:hover fieldset': {
                    borderColor: '#60a5fa',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#3b82f6',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#3b82f6',
                },
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
                  '& fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&:hover fieldset': {
                    borderColor: '#60a5fa',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#3b82f6',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#3b82f6',
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPasswordDialog(false)}>Отмена</Button>
            <Button
              onClick={handleChangePassword}
              variant="contained"
              sx={{
                backgroundColor: '#3b82f6',
                '&:hover': {
                  backgroundColor: '#60a5fa',
                },
              }}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            background: (theme) => theme.palette.background.paper,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Аналитика просмотров
          </Typography>
          <Tabs value={analyticsTab} onChange={(e, newValue) => setAnalyticsTab(newValue)} sx={{ mb: 4 }}>
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
                <>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Распределение просмотров по жанрам
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.genres || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(analyticsData?.genres || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            style={{ transition: 'all 0.3s ease' }}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              )}
              {analyticsTab === 'countries' && (
                <>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Распределение просмотров по странам
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData?.countries || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#3b82f6">
                        {(analyticsData?.countries || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            style={{ transition: 'all 0.3s ease' }}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
              {analyticsTab === 'weekday_views' && (
                <>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Время просмотра по дням недели (в часах)
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={weekdayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="weekday" />
                      <YAxis
                        label={{
                          value: 'Часы',
                          angle: -90,
                          position: 'insideLeft',
                          offset: 10,
                        }}
                        dataKey="durationHours"
                      />
                      <RechartsTooltip
                        formatter={(value, name, props) => props.payload.durationFormatted}
                      />
                      <Line
                        type="monotone"
                        dataKey="durationHours"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        style={{ transition: 'all 0.3s ease' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}
              {analyticsTab === 'top_actors' && (
                <>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Актёры, которые встречались в фильмах, которые вы смотрели
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={analyticsData?.top_actors || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#3b82f6">
                        {(analyticsData?.top_actors || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            style={{ transition: 'all 0.3s ease' }}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default Profile;