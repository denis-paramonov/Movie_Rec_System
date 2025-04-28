import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  Autocomplete,
  Checkbox,
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
import { Movie, History, Person, Logout, Search as SearchIcon, ExpandMore, ExpandLess, CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useQuery } from 'react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { ThemeContext } from './App';

// Статический текст саммари для случая ошибки
const fallbackSummary = `### Саммаризация текста:\n\nФильм «Шрек навсегда» (четвёртая часть эпопеи) получил смешанные отзывы зрителей и критиков. Основные моменты, выделенные пользователями:\n\n- Философская направленность и зрелость сюжета: Многие отметили, что мультфильм стал более взрослым, поднимая экзистенциальные вопросы о смысле жизни, счастье и кризисе среднего возраста. Это сделало его интересным для взрослой аудитории, но несколько снизило уровень юмора и комичности, что разочаровало некоторых зрителей.\n\n- Юмор и пародии: Несмотря на снижение уровня шуток по сравнению с предыдущими частями, фильм сохранил пародийный стиль, высмеивая популярные фильмы и культурные явления, что понравилось многим зрителям.\n\n- Графика и визуальные эффекты: Пользователи отметили высокое качество графики, особенно в 3D-формате, и выразительные сцены, которые впечатляли своей детализацией и зрелищностью.\n\n- Смешанные эмоции от финала: Некоторые зрители были разочарованы тем, что фильм не оправдал их ожиданий, считая его менее смешным и более предсказуемым, чем предыдущие части. Другие, напротив, оценили его как достойное завершение серии, подчеркнув, что он поднимает важные темы и оставляет хорошее настроение.\n\n- Разнообразие восприятия: Отзывы варьировались от восторженных до негативных, в зависимости от ожиданий и предпочтений зрителей. Одни считали фильм глубоким и трогательным, другие — скучным и предсказуемым.\n\n### Общее мнение пользователей:\nФильм «Шрек навсегда» стал более зрелым и философским по сравнению с предыдущими частями, что привлекло взрослую аудиторию, но разочаровало тех, кто ожидал традиционного уровня юмора и комедийности. Визуальные эффекты и графика впечатлили, однако сюжет показался менее динамичным и интересным для детей. В целом, фильм получил смешанные отзывы, но многие зрители считают его достойным завершением серии.`;

// Функция для форматирования текста саммари
const formatSummary = (summary) => {
  if (!summary) return [];
  let formatted = summary
    .replace(/###\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
  const parts = formatted.split('<br><br>').map((part) => {
    if (part.startsWith('Саммаризация текста:') || part.startsWith('Общее мнение пользователей:')) {
      return { type: 'header', content: part };
    }
    return { type: 'paragraph', content: part };
  });
  return parts;
};

function Search() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');
  const navigate = useNavigate();
  const { mode } = useContext(ThemeContext);

  // Фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilters, setYearFilters] = useState([]);
  const [countryFilters, setCountryFilters] = useState([]);
  const [genreFilters, setGenreFilters] = useState([]);
  const [page, setPage] = useState(1);

  // Списки для фильтров
  const [years, setYears] = useState([]);
  const [countries, setCountries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [tabValue, setTabValue] = useState('details');
  const [expandedReviews, setExpandedReviews] = useState({});

  // Загрузка уникальных значений для фильтров
  const { data: filterData, isLoading: filtersLoading } = useQuery({
    queryKey: ['movies_filters'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5001/movies/filters');
      return response.data;
    },
    onSuccess: (data) => {
      setYears(data.years || []);
      setCountries(data.countries || []);
      setGenres(data.genres || []);
      setFiltersLoaded(true);
    },
  });

  // Запрос фильмов с фильтрами и пагинацией
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies', searchQuery, yearFilters, countryFilters, genreFilters, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (yearFilters.length > 0) params.append('years', yearFilters.join(','));
      if (countryFilters.length > 0) params.append('countries', countryFilters.join(','));
      if (genreFilters.length > 0) params.append('genres', genreFilters.join(','));
      params.append('page', page);
      params.append('per_page', 21);
      const response = await axios.get(`http://localhost:5001/movies?${params.toString()}`);
      return response.data;
    },
    enabled: filtersLoaded,
  });

  // Запрос саммаризации
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['summary', selectedMovie?.id],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5001/summarize?movie_id=${selectedMovie.id}`);
      return response.data;
    },
    enabled: !!selectedMovie && tabValue === 'summary',
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
              setPage(1);
            }}
            variant="outlined"
            sx={{ flex: '1 1 200px', minWidth: 200 }}
          />
          <Autocomplete
            multiple
            options={years}
            disableCloseOnSelect
            getOptionLabel={(option) => option.toString()}
            value={yearFilters}
            onChange={(event, newValue) => {
              setYearFilters(newValue);
              setPage(1);
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlank fontSize="small" />}
                  checkedIcon={<CheckBox fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Годы" variant="outlined" />
            )}
            sx={{ flex: '1 1 150px', minWidth: 150 }}
          />
          <Autocomplete
            multiple
            options={countries}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            value={countryFilters}
            onChange={(event, newValue) => {
              setCountryFilters(newValue);
              setPage(1);
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlank fontSize="small" />}
                  checkedIcon={<CheckBox fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Страны" variant="outlined" />
            )}
            sx={{ flex: '1 1 150px', minWidth: 150 }}
          />
          <Autocomplete
            multiple
            options={genres}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            value={genreFilters}
            onChange={(event, newValue) => {
              setGenreFilters(newValue);
              setPage(1);
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlank fontSize="small" />}
                  checkedIcon={<CheckBox fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Жанры" variant="outlined" />
            )}
            sx={{ flex: '1 1 150px', minWidth: 150 }}
          />
        </Box>

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
              <Tab label="Саммари" value="summary" />
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
              {tabValue === 'summary' && (
                <Box
                  sx={{
                    width: '100%',
                    maxHeight: 400,
                    overflowY: 'auto',
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  {summaryLoading ? (
                    <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />
                  ) : summaryError ? (
                    <Box>
                      {formatSummary(fallbackSummary).map((part, index) => (
                        <Typography
                          key={index}
                          variant={part.type === 'header' ? 'h6' : 'body1'}
                          sx={{
                            fontWeight: part.type === 'header' ? 'bold' : 'normal',
                            mb: part.type === 'header' ? 2 : 1,
                            whiteSpace: 'pre-wrap',
                          }}
                          dangerouslySetInnerHTML={{ __html: part.content }}
                        />
                      ))}
                    </Box>
                  ) : summaryData?.summary ? (
                    <Box>
                      {formatSummary(summaryData.summary).map((part, index) => (
                        <Typography
                          key={index}
                          variant={part.type === 'header' ? 'h6' : 'body1'}
                          sx={{
                            fontWeight: part.type === 'header' ? 'bold' : 'normal',
                            mb: part.type === 'header' ? 2 : 1,
                            whiteSpace: 'pre-wrap',
                          }}
                          dangerouslySetInnerHTML={{ __html: part.content }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary" align="center">
                      Нет саммари для отображения
                    </Typography>
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