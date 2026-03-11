// Shared API types and constants for IWA-SPA (frontend + backend)

export interface User {
  id: number;
  username: string;
  // INTENTIONAL: password exposed in API responses for training demo
  password?: string;
  email: string;
  role: string;
  bio?: string;
  address?: string;
  avatarPath?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  isPrescriptionOnly: number;
}

export interface CartItem {
  productId: number;
  name?: string;
  qty: number;
  // INTENTIONAL: price editable client-side
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  qty: number;
  priceAtPurchase: number;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  content: string;
  createdAt: string;
  username?: string;
}

export interface Prescription {
  id: number;
  userId: number;
  filePath: string;
  uploadedAt: string;
}

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  PRODUCTS: {
    LIST: '/api/products',
    GET: (id: number | string) => `/api/products/${id}`,
    REVIEWS: (id: number | string) => `/api/products/${id}/reviews`,
  },
  CART: {
    GET: '/api/cart',
    ADD: '/api/cart/add',
    REMOVE: '/api/cart/remove',
    CHECKOUT: '/api/cart/checkout',
  },
  ORDERS: {
    LIST: '/api/orders',
    GET: (id: number | string) => `/api/orders/${id}`,
  },
  ADMIN: {
    USERS: '/api/admin/users',
    USER: (id: number | string) => `/api/admin/users/${id}`,
    PRODUCTS: '/api/admin/products',
    PRODUCT: (id: number | string) => `/api/admin/products/${id}`,
    ORDERS: '/api/admin/orders',
    DIAGNOSTICS: '/api/admin/diagnostics',
  },
  SEARCH: '/api/search',
  UPLOAD: '/api/upload',
};
