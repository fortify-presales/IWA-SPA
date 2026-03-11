import React from 'react';
import { AppBar, Toolbar, Typography, Button, Badge, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

interface NavBarProps {
  cart: any[];
}

export default function NavBar({ cart }: NavBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // INTENTIONAL: admin check done client-side only
  const isAdmin = user?.role === 'admin' || localStorage.getItem('isAdmin') === 'true';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 0, cursor: 'pointer', mr: 2 }}
          onClick={() => navigate('/')}
        >
          💊 IWA Pharmacy
        </Typography>

        <Button color="inherit" onClick={() => navigate('/products')}>Products</Button>
        <Button color="inherit" onClick={() => navigate('/search')}>Search</Button>

        {/* INTENTIONAL: admin link shown if client-side flag set */}
        {isAdmin && (
          <Button color="inherit" onClick={() => navigate('/admin')}>Admin</Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button color="inherit" onClick={() => navigate('/cart')}>
          <Badge badgeContent={cart.length} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </Button>

        {user ? (
          <>
            <Button color="inherit" onClick={() => navigate('/orders')}>Orders</Button>
            <Button color="inherit" onClick={() => navigate('/profile')}>{user.username}</Button>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
            <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
