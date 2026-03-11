import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, Box, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import http from '../services/http';

interface ProductsPageProps {
  cart: any[];
  setCart: (cart: any[]) => void;
}

export default function ProductsPage({ cart, setCart }: ProductsPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    const url = category ? `/api/products?category=${encodeURIComponent(category)}` : '/api/products';
    http.get(url).then((data) => setProducts(data.products || []));
  }, [category]);

  function addToCart(product: any) {
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      setCart(cart.map((i) => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      // INTENTIONAL: price taken from client-side product object, can be manipulated in dev tools
      setCart([...cart, { productId: product.id, name: product.name, qty: 1, price: product.price }]);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Products</Typography>

      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>Category</InputLabel>
        <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {['Pain Relief', 'Antibiotics', 'Vitamins', 'Allergy', 'Digestive', 'Diabetes', 'Cardiovascular'].map(
            (c) => <MenuItem key={c} value={c}>{c}</MenuItem>
          )}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                {/* INTENTIONAL: product description rendered with dangerouslySetInnerHTML – XSS */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                <Box mt={1}>
                  <Typography variant="h6" color="primary">£{product.price.toFixed(2)}</Typography>
                  {product.isPrescriptionOnly ? (
                    <Chip label="Prescription Required" color="warning" size="small" />
                  ) : null}
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/products/${product.id}`)}>Details</Button>
                {/* INTENTIONAL: prescription-only items can be added without a prescription */}
                <Button size="small" variant="contained" onClick={() => addToCart(product)}>
                  Add to Cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
