import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, TextField, Button, Box, Grid,
  Card, CardContent, CardActions, Chip, Alert,
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import http from '../services/http';

interface SearchPageProps {
  cart: any[];
  setCart: (cart: any[]) => void;
}

export default function SearchPage({ cart, setCart }: SearchPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<any[]>([]);
  const [searchMeta, setSearchMeta] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsBannerRef = useRef<HTMLDivElement>(null);

  async function doSearch(q: string) {
    if (!q.trim()) return;
    const data = await http.get(`/api/search?q=${encodeURIComponent(q)}`);
    setResults(data.results || []);
    setSearchMeta(data);
    setHasSearched(true);

    // INTENTIONAL: DOM XSS – inserting search query directly into innerHTML
    if (resultsBannerRef.current) {
      resultsBannerRef.current.innerHTML = `Search results for: <strong>${q}</strong>`;
    }
  }

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
    doSearch(query);
  }

  function addToCart(product: any) {
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      setCart(cart.map((i) => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { productId: product.id, name: product.name, qty: 1, price: product.price }]);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Search Medicines</Typography>

      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Search medicines..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" variant="contained" sx={{ minWidth: 100 }}>Search</Button>
      </Box>

      {/* INTENTIONAL: DOM XSS – innerHTML set above */}
      {hasSearched && <div ref={resultsBannerRef} style={{ marginBottom: 16 }} />}

      {hasSearched && results.length === 0 && (
        <Alert severity="info">No results found.</Alert>
      )}

      <Grid container spacing={3}>
        {results.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                {/* INTENTIONAL: dangerouslySetInnerHTML for Reflected XSS demo */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                <Typography variant="h6" color="primary" mt={1}>
                  £{product.price.toFixed(2)}
                </Typography>
                {product.isPrescriptionOnly ? (
                  <Chip label="Rx" color="warning" size="small" />
                ) : null}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/products/${product.id}`)}>Details</Button>
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
