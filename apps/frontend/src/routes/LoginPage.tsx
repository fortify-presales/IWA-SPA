import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import http from '../services/http';
import { useAuth } from '../App';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await http.post('/api/auth/login', { username, password });
      if (data.token) {
        login(data.token, data.user);
        // INTENTIONAL: check client-side isAdmin flag
        if (data.user?.role === 'admin') {
          localStorage.setItem('isAdmin', 'true');
        }
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      <Box component="form" onSubmit={handleLogin}>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
        <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/register')}>
          Don't have an account? Register
        </Button>
      </Box>
      <Box mt={2}>
        <Typography variant="body2" color="text.secondary">
          Demo: <strong>user / user123</strong> or <strong>admin / admin123</strong>
        </Typography>
      </Box>
    </Container>
  );
}
