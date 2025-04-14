import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Tabs, Tab } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        const response = await axios.post('http://localhost:5001/login', { username, password });
        const { user_id, token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user_id', user_id);
        navigate(`/recommend?user_id=${user_id}`);
      } else {
        const response = await axios.post('http://localhost:5001/register', { username, password });
        setSuccess('Регистрация успешна!');
        setMode('login');
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      if (mode === 'login') {
        setError('Неправильный логин или пароль');
      } else {
        if (err.response?.status === 409) {
          setError('Такой пользователь уже существует');
        } else {
          setError('Регистрация неуспешна');
        }
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setMode(newValue);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 8,
        p: 4,
        bgcolor: 'background.paper',
        boxShadow: 3,
        borderRadius: 2,
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(to bottom, #e8f0fe, #d0e7ff)'
            : 'linear-gradient(to bottom, #1a1a1a, #2c2c2c)',
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        {mode === 'login' ? 'Вход' : 'Регистрация'}
      </Typography>
      <Tabs value={mode} onChange={handleTabChange} sx={{ mb: 4 }}>
        <Tab label="Вход" value="login" />
        <Tab label="Регистрация" value="register" />
      </Tabs>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {success && (
        <Typography color="green" sx={{ mb: 2 }}>
          {success}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Имя пользователя"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          label="Пароль"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: 2,
            py: 1.5,
            px: 4,
            borderRadius: 12,
            '&:hover': {
              animation: 'pulse 1s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' },
              },
            },
          }}
        >
          {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </Button>
      </form>
    </Container>
  );
}

export default Login;
