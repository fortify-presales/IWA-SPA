import React, { useState } from 'react';
import {
  Container, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, TextField, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import http from '../services/http';
import { useAuth } from '../App';

interface CartPageProps {
  cart: any[];
  setCart: (cart: any[]) => void;
}

export default function CartPage({ cart, setCart }: CartPageProps) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // INTENTIONAL: total calculated from client-side prices (can be manipulated)
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function removeFromCart(productId: number) {
    setCart(cart.filter((i) => i.productId !== productId));
  }

  // INTENTIONAL: price editable directly in cart
  function updatePrice(productId: number, price: number) {
    setCart(cart.map((i) => i.productId === productId ? { ...i, price } : i));
  }

  function updateQty(productId: number, qty: number) {
    setCart(cart.map((i) => i.productId === productId ? { ...i, qty } : i));
  }

  async function handleCheckout() {
    if (!token) {
      navigate('/login');
      return;
    }
    setError('');
    try {
      // First sync cart to server
      for (const item of cart) {
        await http.post('/api/cart/add', item);
      }
      const data = await http.post('/api/cart/checkout', {});
      if (data.orderId) {
        setCart([]);
        setMessage(`Order #${data.orderId} placed! Total: £${data.total?.toFixed(2)}`);
      } else {
        setError(data.error || 'Checkout failed');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Shopping Cart</Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {cart.length === 0 ? (
        <Typography>Your cart is empty.</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Qty</TableCell>
                  {/* INTENTIONAL: price editable by user */}
                  <TableCell>Price (editable)</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>{item.name || `Product #${item.productId}`}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.qty}
                        onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                        sx={{ width: 70 }}
                      />
                    </TableCell>
                    <TableCell>
                      {/* INTENTIONAL: price editable – business logic flaw */}
                      <TextField
                        type="number"
                        size="small"
                        value={item.price}
                        onChange={(e) => updatePrice(item.productId, Number(e.target.value))}
                        sx={{ width: 90 }}
                        inputProps={{ step: '0.01' }}
                      />
                    </TableCell>
                    <TableCell>£{(item.price * item.qty).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button color="error" onClick={() => removeFromCart(item.productId)}>Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={2} display="flex" justifyContent="flex-end" alignItems="center" gap={3}>
            <Typography variant="h6">Total: £{total.toFixed(2)}</Typography>
            <Button variant="contained" size="large" onClick={handleCheckout}>
              Checkout
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
