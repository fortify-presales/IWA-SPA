-- IWA-SPA Database Schema
-- INTENTIONAL: no foreign keys, no constraints, permissive lengths for training

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  -- INTENTIONAL: plaintext password storage
  password TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  bio TEXT,
  address TEXT,
  avatarPath TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  description TEXT,
  price REAL,
  category TEXT,
  -- INTENTIONAL: no check constraint on boolean-like field
  isPrescriptionOnly INTEGER DEFAULT 0,
  imageUrl TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  total REAL,
  status TEXT DEFAULT 'pending',
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId INTEGER,
  productId INTEGER,
  qty INTEGER,
  -- INTENTIONAL: client-supplied price used at checkout
  priceAtPurchase REAL
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER,
  userId INTEGER,
  -- INTENTIONAL: stored XSS via unsanitized content
  content TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  filePath TEXT,
  uploadedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  -- INTENTIONAL: predictable/sequential token
  token TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);
