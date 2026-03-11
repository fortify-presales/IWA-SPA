import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Box, Alert, Avatar,
} from '@mui/material';
import http from '../services/http';
import { useAuth } from '../App';

export default function ProfilePage() {
  const { user, login, token } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', bio: '', address: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        address: user.address || '',
        password: '',
      });
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    // INTENTIONAL: IDOR – userId taken from JWT, but server doesn't verify against requesting user
    const data = await http.put(`/api/admin/users/${user?.id}`, {
      ...form,
      role: user?.role,
    });
    if (data.user) {
      login(token!, data.user);
      setMessage('Profile updated!');
    } else {
      setError(data.error || 'Update failed');
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>

      {user?.avatarPath && (
        <Avatar src={user.avatarPath} sx={{ width: 80, height: 80, mb: 2 }} />
      )}

      <Box component="form" onSubmit={handleSave}>
        <TextField fullWidth label="Username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} margin="normal" />
        <TextField fullWidth label="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} margin="normal" />
        {/* INTENTIONAL: bio rendered as HTML elsewhere – stored XSS */}
        <TextField fullWidth multiline rows={3} label="Bio (HTML allowed)"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })} margin="normal" />
        <TextField fullWidth label="Address" value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })} margin="normal" />
        <TextField fullWidth label="New Password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} margin="normal"
          helperText="Leave blank to keep current password" />
        {message && <Alert severity="success" sx={{ mt: 1 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save Changes</Button>
      </Box>

      {/* INTENTIONAL: bio rendered with innerHTML – stored XSS */}
      {user?.bio && (
        <Box mt={3}>
          <Typography variant="h6">Bio Preview</Typography>
          <div dangerouslySetInnerHTML={{ __html: user.bio }} />
        </Box>
      )}
    </Container>
  );
}
