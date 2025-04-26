import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Pagination,
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
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import { Movie, History as HistoryIcon, Person, Logout, ExpandMore, ExpandLess, Search as SearchIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { ThemeContext } from './App';

function History() {
  const [history, setHistory] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');
  const navigate = useNavigate();
  const itemsPerPage = 21;
  const [tabValue, setTabValue] = useState('details');
  const [expandedReviews, setExpandedReviews] = useState({});
  const { mode } = useContext(ThemeContext);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setError('Идентификатор пользователя не указан');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5001/history?user_id=${userId}`);
      const validHistory = Array.isArray(response.data)
        ? response.data.filter((movie) => movie && typeof movie === 'object' && 'id' in movie)
        : [];
      setHistory(validHistory);
    } catch (error) {
      console.error('Не удалось загрузить историю:', error);
      setError('Ошибка загрузки истории');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCardClick = (movie) => {
    setSelectedMovie(movie);
    setTabValue('details');
    setExpandedReviews({});
  };

  const handleCloseDialog = () => {
    setSelectedMovie(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleReviewExpand = (index) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const parseReviews = (reviewsStr) => {
    if (!reviewsStr || typeof reviewsStr !== 'string') return [];
    try {
      const parsed = JSON.parse(reviewsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Ошибка парсинга отзывов:', e);
      return [];
    }
  };

  const paginatedHistory = history.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

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
            История просмотров
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
                <HistoryIcon />
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
      <Container maxWidth="lg" sx={{ mt: 4, p: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
          component={motion.div}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          История просмотров пользователя {userId || 'Неизвестный'}
        </Typography>
        {loading ? (
          <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />
        ) : error ? (
          <Typography variant="h6" color="error" align="center" sx={{ mt: 4 }}>
            {error}
          </Typography>
        ) : history.length === 0 ? (
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
            История просмотров пуста
          </Typography>
        ) : (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Показаны {paginatedHistory.length} из {history.length} фильмов
            </Typography>
            <Grid container spacing={4}>
              {paginatedHistory.map((movie, index) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={movie.id || `movie-${index}`}>
                  <Card
                    component={motion.div}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: (theme) => `1px solid ${theme.palette.cardBorder}`,
                      transition: 'box-shadow 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                      },
                      maxWidth: { xs: 300, sm: '100%' },
                      mx: { xs: 'auto', sm: 0 },
                    }}
                    onClick={() => handleCardClick(movie)}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        aspectRatio: '2/3',
                        objectFit: 'contain',
                        width: '100%',
                        backgroundColor: 'background.paper',
                      }}
                      image={movie.link || 'https://via.placeholder.com/600x900?text=Нет+изображения'}
                      alt={movie.name || 'Неизвестный'}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x900?text=Нет+изображения';
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        {movie.name || 'Неизвестный'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {movie.year || 'Н/Д'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Pagination
              count={Math.ceil(history.length / itemsPerPage)}
              page={page}
              onChange={handlePageChange}
              sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
            />
          </>
        )}

        {selectedMovie && (
          <Dialog
            open={!!selectedMovie}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            TransitionComponent={motion.div}
            TransitionProps={{
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.9 },
              transition: { duration: 0.3, ease: 'easeInOut' },
            }}
          >
            <DialogTitle>{selectedMovie.name || 'Неизвестный'}</DialogTitle>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
              <Tab label="Детали" value="details" />
              <Tab label="Отзывы" value="reviews" />
            </Tabs>
            <DialogContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, p: 2 }}>
              {tabValue === 'details' && (
                <>
                  <CardMedia
                    component="img"
                    sx={{
                      width: { xs: '100%', sm: 200 },
                      aspectRatio: '2/3',
                      objectFit: 'contain',
                      borderRadius: 2,
                    }}
                    image={selectedMovie.link || 'https://via.placeholder.com/600x900?text=Нет+изображения'}
                    alt={selectedMovie.name || 'Неизвестный'}
                  />
                  <Box>
                    <Typography variant="body1" paragraph>
                      <strong>Описание:</strong> {selectedMovie.description || 'Н/Д'}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Год:</strong> {selectedMovie.year || 'Н/Д'}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Жанры:</strong>{' '}
                      {Array.isArray(selectedMovie.genres) ? selectedMovie.genres.join(', ') : 'Н/Д'}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Страна:</strong>{' '}
                      {Array.isArray(selectedMovie.country) ? selectedMovie.country.join(', ') : 'Н/Д'}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Актёры:</strong>{' '}
                      {Array.isArray(selectedMovie.actors) ? selectedMovie.actors.join(', ') : 'Н/Д'}
                    </Typography>
                  </Box>
                </>
              )}
              {tabValue === 'reviews' && (
                <Box sx={{ width: '100%' }}>
                  {parseReviews(selectedMovie.reviews).length === 0 ? (
                    <Typography variant="body1" color="text.secondary" align="center">
                      Отзывы отсутствуют
                    </Typography>
                  ) : (
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {parseReviews(selectedMovie.reviews).map((review, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            mb: 2,
                            p: 2,
                            border: (theme) => `1px solid ${theme.palette.cardBorder}`,
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {review.author || 'Аноним'}
                              </Typography>
                            }
                            secondary={
                              <Collapse
                                in={expandedReviews[index] || review.text.length <= 200}
                                collapsedSize="3em"
                              >
                                <Typography variant="body2">
                                  {review.text || 'Текст отзыва отсутствует'}
                                </Typography>
                              </Collapse>
                            }
                          />
                          {review.text.length > 200 && (
                            <Button
                              size="small"
                              onClick={() => toggleReviewExpand(index)}
                              startIcon={expandedReviews[index] ? <ExpandLess /> : <ExpandMore />}
                              sx={{ mt: 1 }}
                            >
                              {expandedReviews[index] ? 'Свернуть' : 'Читать дальше'}
                            </Button>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary" variant="contained" sx={{ borderRadius: 8, backgroundColor: '#3b82f6', '&:hover': { backgroundColor: '#60a5fa' } }}>
                Закрыть
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </Box>
  );
}

export default History;