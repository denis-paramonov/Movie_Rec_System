import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
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
} from '@mui/material';
import { ArrowBack, ExpandMore, ExpandLess } from '@mui/icons-material';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function History() {
  const [history, setHistory] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 20;
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState('details');
  const [expandedReviews, setExpandedReviews] = useState({});

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setError('Идентификатор пользователя не указан');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5001/history?user_id=${userId}`);
      console.log('History response:', response.data);
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
    console.log('Selected movie:', movie);
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
    console.log('Parsing reviews:', reviewsStr, typeof reviewsStr);
    if (!reviewsStr || typeof reviewsStr !== 'string') {
      console.warn('Reviews is empty or not a string:', reviewsStr);
      return [];
    }
    try {
      const parsed = JSON.parse(reviewsStr);
      console.log('Parsed reviews:', parsed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Ошибка парсинга отзывов:', e, 'Input:', reviewsStr);
      return [];
    }
  };

  const paginatedHistory = history.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(to bottom, #e8f0fe, #d0e7ff)'
            : 'linear-gradient(to bottom, #1a1a1a, #2c2c2c)',
      }}
    >
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            История просмотров
          </Typography>
          <ThemeToggle />
          <Button color="inherit" onClick={handleLogout}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, p: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          История просмотров для пользователя {userId || 'Неизвестный'}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/recommend?user_id=${userId}`)}
          sx={{
            mb: 4,
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
          disabled={!userId}
        >
          Вернуться к рекомендациям
        </Button>
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
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: (theme) => `1px solid ${theme.palette.cardBorder}`,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                      },
                      animation: 'fadeIn 0.5s ease-in-out',
                      '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateY(20px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' },
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
            sx={{
              '& .MuiDialog-paper': {
                animation: 'dialogFadeIn 0.3s ease-in-out',
                '@keyframes dialogFadeIn': {
                  '0%': { opacity: 0, transform: 'scale(0.9)' },
                  '100%': { opacity: 1, transform: 'scale(1)' },
                },
              },
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
              <Button onClick={handleCloseDialog} color="primary" variant="contained" sx={{ borderRadius: 8 }}>
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