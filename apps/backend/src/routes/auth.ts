import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db/database';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'insecure-jwt-secret-do-not-use-in-production';

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { username, password, email, role } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'username, password and email are required' });
  }

  // INTENTIONAL: no password complexity requirements
  // INTENTIONAL: role escalation – client can set role to 'admin'
  const userRole = role || 'user';

  // INTENTIONAL: password stored in plaintext
  const stmt = db.prepare(
    `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`
  );
  try {
    const result = stmt.run(username, password, email, userRole);
    const userId = result.lastInsertRowid;

    // INTENTIONAL: no token expiry
    const token = jwt.sign({ id: userId, username, role: userRole }, JWT_SECRET);

    return res.status(201).json({ token, user: { id: userId, username, email, role: userRole } });
  } catch (err: any) {
    // INTENTIONAL: verbose error leaks DB details
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // INTENTIONAL: SQL Injection via string concatenation
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  try {
    const user = db.prepare(query).get() as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // INTENTIONAL: no token expiry
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);

    // INTENTIONAL: password returned in response
    return res.json({ token, user });
  } catch (err: any) {
    // INTENTIONAL: verbose error exposes SQL query details
    return res.status(500).json({ error: err.message, query });
  }
});

// POST /api/auth/logout
// INTENTIONAL: tokens not invalidated server-side
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({ message: 'Logged out (client should delete token)' });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    // INTENTIONAL: no expiry check
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id) as any;
    // INTENTIONAL: returns full user including password
    return res.json({ user });
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid token', details: err.message });
  }
});

// POST /api/auth/reset-password
// INTENTIONAL: predictable sequential reset token
router.post('/reset-password', (req: Request, res: Response) => {
  const { email } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // INTENTIONAL: token is just the user ID – extremely predictable
  const token = String(user.id);
  db.prepare('INSERT INTO password_reset_tokens (userId, token) VALUES (?, ?)').run(user.id, token);

  // INTENTIONAL: token returned in response (should be emailed only)
  return res.json({ message: 'Reset token generated', token });
});

// POST /api/auth/reset-password/confirm
router.post('/reset-password/confirm', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const record = db.prepare('SELECT * FROM password_reset_tokens WHERE token = ?').get(token) as any;
  if (!record) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  // INTENTIONAL: no token expiry check, no one-time use enforcement
  // INTENTIONAL: plaintext password stored
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, record.userId);

  return res.json({ message: 'Password updated' });
});

export default router;
