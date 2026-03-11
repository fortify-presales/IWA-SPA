import { Router, Request, Response } from 'express';
import db from '../db/database';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// GET /api/products
// INTENTIONAL: no pagination limit – can dump entire table
router.get('/', optionalAuth, (req: Request, res: Response) => {
  const { category } = req.query;

  let query = 'SELECT * FROM products';
  if (category) {
    // INTENTIONAL: SQL Injection via string concatenation in filter
    query += ` WHERE category = '${category}'`;
  }

  try {
    const products = db.prepare(query).all();
    return res.json({ products });
  } catch (err: any) {
    // INTENTIONAL: verbose SQL error returned
    return res.status(500).json({ error: err.message, query });
  }
});

// GET /api/products/:id
router.get('/:id', optionalAuth, (req: Request, res: Response) => {
  const { id } = req.params;

  // INTENTIONAL: SQL Injection via string concatenation
  const query = `SELECT * FROM products WHERE id = ${id}`;

  try {
    const product = db.prepare(query).get() as any;
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const reviews = db.prepare(
      'SELECT r.*, u.username FROM reviews r JOIN users u ON r.userId = u.id WHERE r.productId = ?'
    ).all(product.id);

    return res.json({ product, reviews });
  } catch (err: any) {
    return res.status(500).json({ error: err.message, query });
  }
});

// GET /api/products/:id/reviews
router.get('/:id/reviews', (req: Request, res: Response) => {
  const { id } = req.params;
  // INTENTIONAL: no ownership check, no auth required
  const reviews = db.prepare(
    `SELECT r.*, u.username FROM reviews r JOIN users u ON r.userId = u.id WHERE r.productId = ${id}`
  ).all();
  return res.json({ reviews });
});

// POST /api/products/:id/reviews
// INTENTIONAL: unauthenticated users can post reviews
router.post('/:id/reviews', optionalAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  // INTENTIONAL: stored XSS – content not sanitised
  const { content } = req.body;
  const user = (req as any).user;
  const userId = user ? user.id : 0;

  db.prepare('INSERT INTO reviews (productId, userId, content) VALUES (?, ?, ?)').run(id, userId, content);
  return res.status(201).json({ message: 'Review added' });
});

export default router;
