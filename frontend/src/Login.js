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
} from '@mui/material';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { ThemeContext } from './App';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: mode === 'light'
          ? 'linear-gradient(to bottom, #e8f0fe, #d0e7ff)'
          : 'linear-gradient(to bottom, #1a202c, #2d3748)',
        position: 'relative',
      }}
    >
      <ThemeToggle sx={{ position: 'absolute', top: 16, right: 16 }} />
      <Container maxWidth="sm">
        <Box
          sx={{
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Добро пожаловать
          </Typography>
          <Button
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: '#3b82f6',
              '&:hover': { backgroundColor: '#60a5fa' },
            }}
            onClick={() => setOpenLoginDialog(true)}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Войти
          </Button>
          <Button
            variant="outlined"
            sx={{
              mt: 2,
              ml: 2,
              color: '#3b82f6',
              borderColor: '#3b82f6',
              '&:hover': { borderColor: '#60a5fa', color: '#60a5fa' },
            }}
            onClick={() => setOpenRegisterDialog(true)}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Регистрация
          </Button>
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
        <DialogTitle>Вход</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
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
            label="Пароль"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <Link
            component="button"
            variant="body2"
            onClick={() => {
              setOpenLoginDialog(false);
              setOpenRegisterDialog(true);
            }}
            sx={{ mt: 1, display: 'block', color: '#3b82f6' }}
          >
            Нет аккаунта? Зарегистрируйтесь
          </Link>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLoginDialog(false)}>Отмена</Button>
          <Button
            onClick={handleLogin}
            variant="contained"
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': { backgroundColor: '#60a5fa' },
            }}
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
        <DialogTitle>Регистрация</DialogTitle>
        <DialogContent>
          {registerError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {registerError}
            </Typography>
          )}
          {registerSuccess && (
            <Typography color="green" sx={{ mb: 2 }}>
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
            label="Пароль"
            type="password"
            fullWidth
            margin="normal"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
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
            label="Подтвердите пароль"
            type="password"
            fullWidth
            margin="normal"
            value={registerConfirmPassword}
            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
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
          <Link
            component="button"
            variant="body2"
            onClick={() => {
              setOpenRegisterDialog(false);
              setOpenLoginDialog(true);
            }}
            sx={{ mt: 1, display: 'block', color: '#3b82f6' }}
          >
            Уже есть аккаунт? Войдите
          </Link>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRegisterDialog(false)}>Отмена</Button>
          <Button
            onClick={handleRegister}
            variant="contained"
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': { backgroundColor: '#60a5fa' },
            }}
          >
            Зарегистрироваться
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Login;