import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function History() {
  const [history, setHistory] = useState([]);
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

  return (
    <Container maxWidth="md" sx={{ mt: 8, p: 4, bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        Watch History for User {userId}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => navigate(`/recommend?user_id=${userId}`)}
        sx={{ mb: 2 }}
      >
        Back to Recommendations
      </Button>
      <List>
        {history.map((movie) => (
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
                    Country: {movie.country || 'N/A'}<br />
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

export default History;
