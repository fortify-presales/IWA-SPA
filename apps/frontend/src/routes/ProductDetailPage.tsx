import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, Chip, TextField, Divider,
  Card, CardContent, Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import http from '../services/http';
import { useAuth } from '../App';

interface ProductDetailPageProps {
  cart: any[];
  setCart: (cart: any[]) => void;
}

export default function ProductDetailPage({ cart, setCart }: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    http.get(`/api/products/${id}`).then((data) => {
      setProduct(data.product);
      setReviews(data.reviews || []);
    });
  }, [id]);

  function addToCart() {
    if (!product) return;
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      setCart(cart.map((i) => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { productId: product.id, name: product.name, qty: 1, price: product.price }]);
    }
    setMessage('Added to cart!');
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    // INTENTIONAL: review content sent without sanitisation (stored XSS)
    await http.post(`/api/products/${id}/reviews`, { content: reviewText });
    setReviewText('');
    const data = await http.get(`/api/products/${id}`);
    setReviews(data.reviews || []);
  }

  if (!product) return <Container sx={{ mt: 4 }}><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4">{product.name}</Typography>
      <Typography variant="subtitle1" color="text.secondary">{product.category}</Typography>

      {/* INTENTIONAL: description rendered with dangerouslySetInnerHTML – XSS */}
      <Box mt={2} dangerouslySetInnerHTML={{ __html: product.description }} />

      <Box mt={2}>
        <Typography variant="h5" color="primary">£{product.price.toFixed(2)}</Typography>
        {product.isPrescriptionOnly ? (
          <Chip label="Prescription Required" color="warning" sx={{ mt: 1 }} />
        ) : null}
      </Box>

      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}

      <Button variant="contained" sx={{ mt: 2 }} onClick={addToCart}>
        Add to Cart
      </Button>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5">Reviews</Typography>

      {reviews.map((review) => (
        <Card key={review.id} sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2">{review.username}</Typography>
            {/* INTENTIONAL: stored XSS – review content rendered as HTML */}
            <Typography
              variant="body2"
              dangerouslySetInnerHTML={{ __html: review.content }}
            />
          </CardContent>
        </Card>
      ))}

      <Box component="form" onSubmit={submitReview} mt={3}>
        <Typography variant="h6">Add a Review</Typography>
        {/* INTENTIONAL: no sanitisation hint to user */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Your review (HTML allowed)"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          margin="normal"
        />
        <Button type="submit" variant="contained">Submit Review</Button>
      </Box>
    </Container>
  );
}
