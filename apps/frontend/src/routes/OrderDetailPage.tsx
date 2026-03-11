import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import http from '../services/http';

export default function OrderDetailPage() {
  // INTENTIONAL: IDOR – any authenticated user can access any order by sequential ID
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    http.get(`/api/orders/${id}`).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setOrder(data.order);
        setItems(data.items || []);
      }
    });
  }, [id]);

  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!order) return <Container sx={{ mt: 4 }}><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Order #{order.id}</Typography>
      <Box mb={2}>
        <Typography>Date: {new Date(order.createdAt).toLocaleString()}</Typography>
        <Typography>User ID: {order.userId}</Typography>
        <Chip label={order.status} color="primary" size="small" />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name || `#${item.productId}`}</TableCell>
                <TableCell>{item.qty}</TableCell>
                <TableCell>£{Number(item.priceAtPurchase).toFixed(2)}</TableCell>
                <TableCell>£{(item.qty * item.priceAtPurchase).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} textAlign="right">
        <Typography variant="h6">Total: £{Number(order.total).toFixed(2)}</Typography>
      </Box>
    </Container>
  );
}
