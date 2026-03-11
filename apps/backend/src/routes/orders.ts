import { Router, Request, Response } from 'express';
import db from '../db/database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/orders
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  // INTENTIONAL: admins can see all orders, but userId override not validated
  const targetUserId = req.query.userId || userId;

  // INTENTIONAL: SQL injection via userId query param
  const query = `SELECT * FROM orders WHERE userId = ${targetUserId} ORDER BY createdAt DESC`;

  try {
    const orders = db.prepare(query).all();
    return res.json({ orders });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
// INTENTIONAL: IDOR – no ownership check; any authenticated user can access any order by ID
router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db.prepare(
    `SELECT oi.*, p.name FROM order_items oi LEFT JOIN products p ON oi.productId = p.id WHERE oi.orderId = ${id}`
  ).all();

  return res.json({ order, items });
});

export default router;
