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

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/recommend?user_id=${userId}`);
        setRecommendations(response.data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      }
    };
    if (userId) fetchRecommendations();
  }, [userId]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleCardClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseDialog = () => {
    setSelectedMovie(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, p: 4, bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        Recommendations for User {userId}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleLogout}
        sx={{ mr: 2, mb: 4 }}
      >
        Logout
      </Button>
      <Button
        variant="outlined"
        onClick={() => navigate(`/history?user_id=${userId}`)}
        sx={{ mb: 4 }}
      >
        View Watch History
      </Button>
      <Grid container spacing={3}>
        {recommendations.map((movie) => (
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

export default Recommendations;
