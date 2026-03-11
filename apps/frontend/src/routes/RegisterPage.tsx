import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import http from '../services/http';
import { useAuth } from '../App';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'user' });
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      // INTENTIONAL: role sent from client – can be set to 'admin'
      const data = await http.post('/api/auth/register', form);
      if (data.token) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Register</Typography>
      <Box component="form" onSubmit={handleRegister}>
        <TextField fullWidth label="Username" name="username" value={form.username}
          onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Email" name="email" type="email" value={form.email}
          onChange={handleChange} margin="normal" />
        {/* INTENTIONAL: no password complexity hints */}
        <TextField fullWidth label="Password" name="password" type="password" value={form.password}
          onChange={handleChange} margin="normal" />
        {/* INTENTIONAL: role field exposed to user – role escalation possible */}
        <TextField fullWidth label="Role (user/admin)" name="role" value={form.role}
          onChange={handleChange} margin="normal" helperText="INTENTIONAL: role editable by user" />
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </Box>
    </Container>
  );
}
