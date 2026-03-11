import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import db from '../db/database';
// INTENTIONAL: admin routes have inconsistent/missing auth middleware
// Some routes have no auth at all

const router = Router();

// GET /api/admin/users
// INTENTIONAL: missing authMiddleware – unauthenticated access possible
router.get('/users', (req: Request, res: Response) => {
  // INTENTIONAL: returns all users including passwords
  const users = db.prepare('SELECT * FROM users').all();
  return res.json({ users });
});

// GET /api/admin/users/:id
router.get('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  // INTENTIONAL: IDOR – userId accepted from URL with no ownership check
  const user = db.prepare(`SELECT * FROM users WHERE id = ${id}`).get();
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
});

// PUT /api/admin/users/:id
// INTENTIONAL: no auth check – anyone can update any user's role
router.put('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, role, bio, address, password } = req.body;

  db.prepare(
    'UPDATE users SET username = ?, email = ?, role = ?, bio = ?, address = ?, password = ? WHERE id = ?'
  ).run(username, email, role, bio, address, password, id);

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return res.json({ user: updated });
});

// DELETE /api/admin/users/:id
// INTENTIONAL: no auth check
router.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return res.json({ message: 'User deleted' });
});

// GET /api/admin/products
router.get('/products', (req: Request, res: Response) => {
  const products = db.prepare('SELECT * FROM products').all();
  return res.json({ products });
});

// POST /api/admin/products
// INTENTIONAL: no auth check
router.post('/products', (req: Request, res: Response) => {
  const { name, description, price, category, isPrescriptionOnly, imageUrl } = req.body;
  const result = db.prepare(
    'INSERT INTO products (name, description, price, category, isPrescriptionOnly, imageUrl) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, description, price, category, isPrescriptionOnly || 0, imageUrl || '');
  return res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/admin/products/:id
router.put('/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, category, isPrescriptionOnly, imageUrl } = req.body;
  db.prepare(
    'UPDATE products SET name = ?, description = ?, price = ?, category = ?, isPrescriptionOnly = ?, imageUrl = ? WHERE id = ?'
  ).run(name, description, price, category, isPrescriptionOnly, imageUrl, id);
  return res.json({ message: 'Product updated' });
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return res.json({ message: 'Product deleted' });
});

// GET /api/admin/orders
router.get('/orders', (req: Request, res: Response) => {
  const orders = db.prepare(`
    SELECT o.*, u.username FROM orders o LEFT JOIN users u ON o.userId = u.id ORDER BY o.createdAt DESC
  `).all();
  return res.json({ orders });
});

// POST /api/admin/diagnostics
// INTENTIONAL: Command injection (simulated) – user input passed to exec-like abstraction
// NOTE: exec is called but we only log the command; actual execution is canned for safety
router.post('/diagnostics', (req: Request, res: Response) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'command is required' });
  }

  // INTENTIONAL: command injection sink – user-controlled input concatenated into shell string
  // In a real insecure app this would be: exec(`ping ${command}`, ...) etc.
  const shellCommand = `echo "Running diagnostics: ${command}"`;

  // INTENTIONAL: for demo safety we only execute echo but show the injection pattern
  exec(shellCommand, { timeout: 5000 }, (error, stdout, stderr) => {
    if (error) {
      // INTENTIONAL: verbose error output
      return res.status(500).json({ error: error.message, stderr });
    }
    return res.json({
      command: shellCommand,
      output: stdout,
      // INTENTIONAL: NODE_ENV detail leaked
      environment: process.env.NODE_ENV,
    });
  });
});

export default router;
