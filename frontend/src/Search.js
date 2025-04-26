import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
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
  Pagination,
} from '@mui/material';
import { Movie, History, Person, Logout, Search as SearchIcon, ExpandMore, ExpandLess } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useQuery } from 'react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { ThemeContext } from './App';

function Search() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');
  const navigate = useNavigate();
  const { mode } = useContext(ThemeContext);

  // Фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [page, setPage] = useState(1);

  // Списки для фильтров (загружаем один раз)
  const [years, setYears] = useState([]);
  const [countries, setCountries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [tabValue, setTabValue] = useState('details');
  const [expandedReviews, setExpandedReviews] = useState({});

  // Загрузка уникальных значений для фильтров (один раз)
  const { data: allMoviesData, isLoading: filtersLoading } = useQuery({
    queryKey: ['movies_filters'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5001/movies');
      return response.data.movies;
    },
    onSuccess: (movies) => {
      const validMovies = Array.isArray(movies)
        ? movies.filter((movie) => movie && typeof movie === 'object' && 'id' in movie)
        : [];
      const uniqueYears = [...new Set(validMovies.map(movie => movie.year).filter(year => year))].sort();
      const uniqueCountries = [...new Set(validMovies.flatMap(movie => movie.country).filter(country => country))];
      const uniqueGenres = [...new Set(validMovies.flatMap(movie => movie.genres).filter(genre => genre))];
      setYears(uniqueYears);
      setCountries(uniqueCountries);
      setGenres(uniqueGenres);
      setFiltersLoaded(true);
    },
  });

  // Запрос фильмов с фильтрами и пагинацией
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies', searchQuery, yearFilter, countryFilter, genreFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (yearFilter) params.append('year', Number(yearFilter)); // Преобразуем в число
      if (countryFilter) params.append('country', countryFilter);
      if (genreFilter) params.append('genre', genreFilter);
      params.append('page', page);
      params.append('per_page', 21);
      console.log('Sending request with params:', params.toString()); // Логирование для отладки
      const response = await axios.get(`http://localhost:5001/movies?${params.toString()}`);
      console.log('Received response:', response.data); // Логирование ответа
      return response.data;
    },
    enabled: filtersLoaded, // Запрашиваем фильмы только после загрузки фильтров
  });

  const movies = data?.movies || [];
  const totalPages = data?.total_pages || 1;

  const handleCardClick = (movie) => {
    setSelectedMovie(movie);
    setTabValue('details');
    setExpandedReviews({});
  };

  const handleCloseDialog = () => {
    setSelectedMovie(null);
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
    } catch (error) {
      console.error('Ошибка парсинга отзывов:', error);
      return [];
    }
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
            Поиск фильмов
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

      <Container maxWidth="lg" sx={{ mt: 4, p: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Поиск фильмов
        </Typography>

        {/* Фильтры */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 4,
            p: 2,
            borderRadius: 2,
            bgcolor: mode === 'light' ? '#f5f5f5' : '#2d3748',
          }}
        >
          <TextField
            label="Поиск по названию"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Сбрасываем страницу при изменении фильтров
            }}
            variant="outlined"
            sx={{ flex: '1 1 200px', minWidth: 200 }}
          />
          <FormControl sx={{ flex: '1 1 150px', minWidth: 150 }}>
            <InputLabel>Год</InputLabel>
            <Select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              label="Год"
            >
              <MenuItem value="">Все годы</MenuItem>
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: '1 1 150px', minWidth: 150 }}>
            <InputLabel>Страна</InputLabel>
            <Select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setPage(1);
              }}
              label="Страна"
            >
              <MenuItem value="">Все страны</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: '1 1 150px', minWidth: 150 }}>
            <InputLabel>Жанр</InputLabel>
            <Select
              value={genreFilter}
              onChange={(e) => {
                setGenreFilter(e.target.value);
                setPage(1);
              }}
              label="Жанр"
            >
              <MenuItem value="">Все жанры</MenuItem>
              {genres.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Результаты поиска */}
        {isLoading || filtersLoading ? (
          <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />
        ) : error ? (
          <Typography variant="h6" color="error" align="center" sx={{ mt: 4 }}>
            Ошибка загрузки фильмов
          </Typography>
        ) : movies.length === 0 ? (
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
            Фильмы не найдены
          </Typography>
        ) : (
          <>
            <Grid container spacing={4}>
              {movies.map((movie, index) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={movie.id || `movie-${index}`}>
                  <Card
                    component={motion.div}
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: (theme) => `1px solid ${theme.palette.cardBorder}`,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
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

            {/* Пагинация */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Диалог с деталями фильма */}
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
              <Button
                onClick={handleCloseDialog}
                variant="contained"
                sx={{
                  borderRadius: 8,
                  backgroundColor: '#3b82f6',
                  '&:hover': { backgroundColor: '#60a5fa' },
                }}
              >
                Закрыть
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </Box>
  );
}

export default Search;