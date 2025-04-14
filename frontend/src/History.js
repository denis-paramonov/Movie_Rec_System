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
  DialogActions
} from '@mui/material';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function History() {
  const [history, setHistory] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/history?user_id=${userId}`);
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
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
      <Grid container spacing={3}>
        {history.map((movie) => (
          <Grid item xs={12} sm={6} md={3} key={movie.id}>
            <Card
              sx={{ cursor: 'pointer', height: '100%' }}
              onClick={() => handleCardClick(movie)}
            >
              <CardMedia
                component="img"
                height="200"
                image={movie.link || 'https://via.placeholder.com/150'}
                alt={movie.name}
              />
              <CardContent>
                <Typography variant="h6" align="center">
                  {movie.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedMovie && (
        <Dialog open={!!selectedMovie} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedMovie.name}</DialogTitle>
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
