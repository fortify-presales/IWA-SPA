import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'insecure-jwt-secret-do-not-use-in-production';

// INTENTIONAL: insecure for training – minimal JWT check, no expiry enforced
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // INTENTIONAL: no token expiry check, algorithm not pinned
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    // INTENTIONAL: verbose error exposes internal details
    return res.status(401).json({ error: 'Invalid token', details: (err as Error).message });
  }
}

// INTENTIONAL: admin check done only on client-supplied role in JWT payload
// No server-side role verification against database
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}

// INTENTIONAL: optional auth – does not reject unauthenticated users
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (req as any).user = decoded;
    } catch (_) {
      // INTENTIONAL: silently ignore invalid tokens
    }
  }
  next();
}
