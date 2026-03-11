import { Router, Request, Response } from 'express';
import db from '../db/database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// In-memory cart store (per-session via token)
// INTENTIONAL: in-memory only, no persistence, no validation
const carts: Record<number, Array<{ productId: number; qty: number; price: number }>> = {};

// GET /api/cart
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const cart = carts[userId] || [];
  return res.json({ cart });
});

// POST /api/cart/add
router.post('/add', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  // INTENTIONAL: client-supplied price accepted without server-side check
  const { productId, qty, price } = req.body;

  if (!carts[userId]) carts[userId] = [];

  const existing = carts[userId].find((item) => item.productId === productId);
  if (existing) {
    existing.qty += qty || 1;
    // INTENTIONAL: price overwritten with client-supplied value
    existing.price = price;
  } else {
    carts[userId].push({ productId, qty: qty || 1, price });
  }

  return res.json({ cart: carts[userId] });
});

// POST /api/cart/remove
router.post('/remove', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { productId } = req.body;
  if (carts[userId]) {
    carts[userId] = carts[userId].filter((item) => item.productId !== productId);
  }
  return res.json({ cart: carts[userId] || [] });
});

// POST /api/cart/checkout
router.post('/checkout', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const cart = carts[userId] || [];

  if (cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // INTENTIONAL: total calculated from client-supplied prices (can be manipulated)
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // INTENTIONAL: no check for prescription-only items
  const orderStmt = db.prepare('INSERT INTO orders (userId, total, status) VALUES (?, ?, ?)');
  const orderResult = orderStmt.run(userId, total, 'pending');
  const orderId = orderResult.lastInsertRowid;

  const itemStmt = db.prepare(
    'INSERT INTO order_items (orderId, productId, qty, priceAtPurchase) VALUES (?, ?, ?, ?)'
  );

  for (const item of cart) {
    itemStmt.run(orderId, item.productId, item.qty, item.price);
  }

  // Clear cart
  delete carts[userId];

  return res.status(201).json({ message: 'Order placed', orderId, total });
});

export default router;
