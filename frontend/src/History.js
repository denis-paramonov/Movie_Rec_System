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
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

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

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setError('No user ID provided');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5001/history?user_id=${userId}`);
      console.log('History response:', response.data);
      const validHistory = Array.isArray(response.data)
        ? response.data.filter(movie => movie && typeof movie === 'object' && 'id' in movie)
        : [];
      setHistory(validHistory);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setError('Failed to load history');
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
  };

  const handleCloseDialog = () => {
    setSelectedMovie(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedHistory = history.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 8, p: 4, bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        Watch History for User {userId || 'Unknown'}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => navigate(`/recommend?user_id=${userId}`)}
        sx={{ mb: 4 }}
        disabled={!userId}
      >
        Back to Recommendations
      </Button>
      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />
      ) : error ? (
        <Typography variant="h6" color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      ) : history.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          Your watch history is empty.
        </Typography>
      ) : (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Showing {paginatedHistory.length} of {history.length} movies
          </Typography>
          <Grid container spacing={3}>
            {paginatedHistory.map((movie, index) => {
              try {
                return (
                  <Grid item xs={12} sm={6} md={3} key={movie.id || `movie-${index}`}>
                    <Card
                      sx={{ cursor: 'pointer', height: '100%' }}
                      onClick={() => handleCardClick(movie)}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={movie.link || 'https://via.placeholder.com/150'}
                        alt={movie.name || 'Unknown'}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                      />
                      <CardContent>
                        <Typography variant="h6" align="center">
                          {movie.name || 'Unknown'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              } catch (e) {

                console.error(`Error rendering movie ${index}:`, movie, e);
                return null;
              }
            })}
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
        <Dialog open={!!selectedMovie} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedMovie.name || 'Unknown'}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              <strong>Description:</strong> {selectedMovie.description || 'N/A'}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Genres:</strong>{' '}
              {Array.isArray(selectedMovie.genres) ? selectedMovie.genres.join(', ') : 'N/A'}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Country:</strong>{' '}
              {Array.isArray(selectedMovie.country) ? selectedMovie.country.join(', ') : 'N/A'}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Actors:</strong>{' '}
              {Array.isArray(selectedMovie.actors) ? selectedMovie.actors.join(', ') : 'N/A'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}

export default History;
