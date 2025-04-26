import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { AccountCircle, Lock as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { ThemeContext } from './App';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const navigate = useNavigate();
  const { mode } = useContext(ThemeContext);

  const handleLogin = async () => {
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/login', {
        username,
        password,
      });
      const { user_id, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      navigate(`/recommend?user_id=${user_id}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка входа');
    }
  };

  const handleRegister = async () => {
    setRegisterError('');
    setRegisterSuccess('');
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Пароли не совпадают');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5001/register', {
        username: registerUsername,
        password: registerPassword,
      });
      setRegisterSuccess('Регистрация успешна! Теперь вы можете войти.');
      setRegisterUsername('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setTimeout(() => {
        setOpenRegisterDialog(false);
        setOpenLoginDialog(true);
      }, 1500);
    } catch (error) {
      setRegisterError(error.response?.data?.error || 'Ошибка регистрации');
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowRegisterPassword = () => setShowRegisterPassword(!showRegisterPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: mode === 'light'
          ? 'linear-gradient(135deg, #e8f0fe 0%, #d0e7ff 100%)'
          : 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: mode === 'light'
            ? 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          animation: 'pulse 10s infinite ease-in-out',
          zIndex: 0,
        },
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)', opacity: 0.5 },
          '50%': { transform: 'scale(1.2)', opacity: 0.8 },
          '100%': { transform: 'scale(1)', opacity: 0.5 },
        },
      }}
    >
      <ThemeToggle sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }} />
      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Box
          sx={{
            p: { xs: 3, sm: 5 },
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: mode === 'light'
              ? '0 10px 30px rgba(0, 0, 0, 0.15)'
              : '0 10px 30px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: mode === 'light'
                ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
              animation: 'rotate 20s linear infinite',
              zIndex: -1,
            },
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: mode === 'light' ? 'text.primary' : 'text.secondary',
              letterSpacing: 1,
            }}
            component={motion.div}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Добро пожаловать
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 4,
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
            component={motion.div}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Войдите или зарегистрируйтесь, чтобы начать
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                backgroundColor: '#3b82f6',
                '&:hover': {
                  backgroundColor: '#60a5fa',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
              onClick={() => setOpenLoginDialog(true)}
              component={motion.button}
              whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              Войти
            </Button>
            <Button
              variant="outlined"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                color: '#3b82f6',
                borderColor: '#3b82f6',
                '&:hover': {
                  borderColor: '#60a5fa',
                  color: '#60a5fa',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
              onClick={() => setOpenRegisterDialog(true)}
              component={motion.button}
              whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              Регистрация
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Диалог для входа */}
      <Dialog
        open={openLoginDialog}
        onClose={() => setOpenLoginDialog(false)}
        TransitionComponent={motion.div}
        TransitionProps={{
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
          transition: { duration: 0.3, ease: 'easeInOut' },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: mode === 'light' ? '#f5f5f5' : '#2d3748',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Вход
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          <TextField
            label="Имя пользователя"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle sx={{ color: '#3b82f6' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#3b82f6' },
                '&:hover fieldset': { borderColor: '#60a5fa' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
              '& .MuiInputLabel-root': { color: '#3b82f6' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
            }}
          />
          <TextField
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#3b82f6' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#3b82f6' },
                '&:hover fieldset': { borderColor: '#60a5fa' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
              '& .MuiInputLabel-root': { color: '#3b82f6' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
            }}
          />
          <Link
            component="button"
            variant="body2"
            onClick={() => {
              setOpenLoginDialog(false);
              setOpenRegisterDialog(true);
            }}
            sx={{ mt: 1, display: 'block', color: '#3b82f6', textAlign: 'center' }}
          >
            Нет аккаунта? Зарегистрируйтесь
          </Link>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button
            onClick={() => setOpenLoginDialog(false)}
            sx={{
              color: '#6b7280',
              fontWeight: 'bold',
              '&:hover': { color: '#9ca3af' },
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleLogin}
            variant="contained"
            sx={{
              px: 4,
              borderRadius: 2,
              backgroundColor: '#3b82f6',
              '&:hover': { backgroundColor: '#60a5fa' },
              fontWeight: 'bold',
            }}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Войти
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог для регистрации */}
      <Dialog
        open={openRegisterDialog}
        onClose={() => setOpenRegisterDialog(false)}
        TransitionComponent={motion.div}
        TransitionProps={{
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
          transition: { duration: 0.3, ease: 'easeInOut' },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: mode === 'light' ? '#f5f5f5' : '#2d3748',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Регистрация
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {registerError && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {registerError}
            </Typography>
          )}
          {registerSuccess && (
            <Typography color="green" sx={{ mb: 2, textAlign: 'center' }}>
              {registerSuccess}
            </Typography>
          )}
          <TextField
            label="Имя пользователя"
            fullWidth
            margin="normal"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle sx={{ color: '#3b82f6' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#3b82f6' },
                '&:hover fieldset': { borderColor: '#60a5fa' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
              '& .MuiInputLabel-root': { color: '#3b82f6' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
            }}
          />
          <TextField
            label="Пароль"
            type={showRegisterPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#3b82f6' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowRegisterPassword} edge="end">
                    {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#3b82f6' },
                '&:hover fieldset': { borderColor: '#60a5fa' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
              '& .MuiInputLabel-root': { color: '#3b82f6' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
            }}
          />
          <TextField
            label="Подтвердите пароль"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={registerConfirmPassword}
            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#3b82f6' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#3b82f6' },
                '&:hover fieldset': { borderColor: '#60a5fa' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
              '& .MuiInputLabel-root': { color: '#3b82f6' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
            }}
          />
          <Link
            component="button"
            variant="body2"
            onClick={() => {
              setOpenRegisterDialog(false);
              setOpenLoginDialog(true);
            }}
            sx={{ mt: 1, display: 'block', color: '#3b82f6', textAlign: 'center' }}
          >
            Уже есть аккаунт? Войдите
          </Link>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button
            onClick={() => setOpenRegisterDialog(false)}
            sx={{
              color: '#6b7280',
              fontWeight: 'bold',
              '&:hover': { color: '#9ca3af' },
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleRegister}
            variant="contained"
            sx={{
              px: 4,
              borderRadius: 2,
              backgroundColor: '#3b82f6',
              '&:hover': { backgroundColor: '#60a5fa' },
              fontWeight: 'bold',
            }}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Зарегистрироваться
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Login;