import React from 'react';
import { Container, Typography, Button, Box, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" gutterBottom>
          💊 IWA Online Pharmacy
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Your trusted (insecure) online pharmacy – for training purposes only
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/products')} sx={{ mr: 2 }}>
          Browse Products
        </Button>
        <Button variant="outlined" size="large" onClick={() => navigate('/search')}>
          Search Medicines
        </Button>
      </Box>

      <Grid container spacing={3}>
        {['Pain Relief', 'Antibiotics', 'Vitamins', 'Allergy'].map((cat) => (
          <Grid item xs={12} sm={6} md={3} key={cat}>
            <Paper
              sx={{ p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
              onClick={() => navigate(`/products?category=${cat}`)}
            >
              <Typography variant="h6">{cat}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box mt={4} p={2} bgcolor="#fff3e0" borderRadius={1}>
        <Typography variant="body2" color="warning.main">
          ⚠️ <strong>WARNING:</strong> This is an intentionally insecure application for security training.
          Do not use real personal information. See DISCLAIMER.md.
        </Typography>
      </Box>
    </Container>
  );
}
