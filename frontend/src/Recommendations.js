import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
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

  return (
    <Container maxWidth="md" sx={{ mt: 8, p: 4, bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        Recommendations for User {userId}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleLogout}
        sx={{ mr: 2, mb: 2 }}
      >
        Logout
      </Button>
      <Button
        variant="outlined"
        onClick={() => navigate(`/history?user_id=${userId}`)}
        sx={{ mb: 2 }}
      >
        View Watch History
      </Button>
      <List>
        {recommendations.map((movie) => (
          <ListItem
            key={movie.id}
            sx={{ bgcolor: 'grey.100', mb: 1, borderRadius: 1 }}
          >
            <ListItemText
              primary={movie.name}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    Genres: {movie.genres?.join(', ') || 'N/A'}<br />
                    Country: {movie.country?.join(', ') || 'N/A'}<br />
                    Actors: {movie.actors?.join(', ') || 'N/A'}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default Recommendations;
  