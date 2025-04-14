import React, { useEffect, useState } from 'react';
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
  Pagination
} from '@mui/material';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function History() {
  const [history, setHistory] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/history?user_id=${userId}`);
        console.log('History response:', response.data);
        setHistory(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setHistory([]);
      }
    };
    if (userId) fetchHistory();
  }, [userId]);

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
        Watch History for User {userId}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => navigate(`/recommend?user_id=${userId}`)}
        sx={{ mb: 4 }}
      >
        Back to Recommendations
      </Button>
      {history.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          Your watch history is empty.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedHistory.map((movie, index) => (
              <Grid item xs={12} sm={6} md={3} key={movie.id || index}>
                <Card
                  sx={{ cursor: 'pointer', height: '100%' }}
                  onClick={() => handleCardClick(movie)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={movie.link || 'https://via.placeholder.com/150'}
                    alt={movie.name || 'Unknown'}
                  />
                  <CardContent>
                    <Typography variant="h6" align="center">
                      {movie.name || 'Unknown'}
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
        <Dialog open={!!selectedMovie} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedMovie.name || 'Unknown'}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              <strong>Description:</strong> {selectedMovie.description || 'N/A'}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Genres:</strong> {selectedMovie.genres?.join(', ') || 'N/A'}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Country:</strong> {selectedMovie.country?.join(', ') || 'N/A'}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Actors:</strong> {selectedMovie.actors?.join(', ') || 'N/A'}
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
