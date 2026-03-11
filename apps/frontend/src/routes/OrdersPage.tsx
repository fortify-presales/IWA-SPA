import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import http from '../services/http';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // INTENTIONAL: IDOR – userId can be passed as query param to see other users' orders
    http.get('/api/orders').then((data) => setOrders(data.orders || []));
  }, []);

  function statusColor(status: string) {
    if (status === 'completed') return 'success';
    if (status === 'shipped') return 'info';
    return 'default';
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>My Orders</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>£{Number(order.total).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={order.status} color={statusColor(order.status) as any} size="small" />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/orders/${order.id}`)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
