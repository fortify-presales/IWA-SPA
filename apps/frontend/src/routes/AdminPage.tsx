import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import http from '../services/http';

// INTENTIONAL: admin page accessible to anyone who sets isAdmin in localStorage
// No server-side auth required to VIEW this page client-side
export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [diagCmd, setDiagCmd] = useState('');
  const [diagOutput, setDiagOutput] = useState('');
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState<any>(null);

  useEffect(() => {
    if (tab === 0) http.get('/api/admin/users').then((d) => setUsers(d.users || []));
    if (tab === 1) http.get('/api/admin/products').then((d) => setProducts(d.products || []));
    if (tab === 2) http.get('/api/admin/orders').then((d) => setOrders(d.orders || []));
  }, [tab]);

  async function deleteUser(id: number) {
    await http.delete(`/api/admin/users/${id}`);
    setUsers(users.filter((u) => u.id !== id));
  }

  async function saveUser() {
    if (!editUser) return;
    await http.put(`/api/admin/users/${editUser.id}`, editUser);
    setEditUser(null);
    http.get('/api/admin/users').then((d) => setUsers(d.users || []));
  }

  async function runDiagnostic(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    // INTENTIONAL: command injection sink – user input sent directly to backend
    const data = await http.post('/api/admin/diagnostics', { command: diagCmd });
    if (data.error) {
      setError(data.error);
    } else {
      setDiagOutput(data.output || '');
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Panel</Typography>
      <Typography variant="body2" color="warning.main" mb={2}>
        ⚠️ INTENTIONAL: This panel has no server-side authentication on most endpoints.
      </Typography>

      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Users" />
        <Tab label="Products" />
        <Tab label="Orders" />
        <Tab label="Diagnostics" />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                {/* INTENTIONAL: password visible in admin panel */}
                <TableCell>Password (plaintext)</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.password}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => setEditUser(u)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => deleteUser(u.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Rx Only</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>£{Number(p.price).toFixed(2)}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.isPrescriptionOnly ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.username || o.userId}</TableCell>
                  <TableCell>£{Number(o.total).toFixed(2)}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>System Diagnostics</Typography>
          <Typography variant="body2" color="warning.main" mb={2}>
            INTENTIONAL: Command Injection sink – input is passed to shell command
          </Typography>
          <Box component="form" onSubmit={runDiagnostic} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Command / hostname (e.g. localhost)"
              value={diagCmd}
              onChange={(e) => setDiagCmd(e.target.value)}
            />
            <Button type="submit" variant="contained">Run</Button>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {diagOutput && (
            <Paper sx={{ p: 2, bgcolor: '#111', color: '#0f0', fontFamily: 'monospace' }}>
              <pre>{diagOutput}</pre>
            </Paper>
          )}
        </Box>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser && (
            <Box>
              <TextField fullWidth label="Username" value={editUser.username}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} margin="normal" />
              <TextField fullWidth label="Email" value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} margin="normal" />
              {/* INTENTIONAL: role editable by admin without server validation */}
              <TextField fullWidth label="Role" value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })} margin="normal" />
              <TextField fullWidth label="Password" value={editUser.password}
                onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} margin="normal" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveUser}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
