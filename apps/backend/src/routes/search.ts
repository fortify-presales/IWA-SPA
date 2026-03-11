import { Router, Request, Response } from 'express';
import db from '../db/database';

const router = Router();

// GET /api/search?q=...
// INTENTIONAL: SQL Injection + Reflected XSS in response
router.get('/', (req: Request, res: Response) => {
  const { q, category } = req.query;

  // INTENTIONAL: SQL Injection via string concatenation with unsanitised user input
  let query = `SELECT * FROM products WHERE name LIKE '%${q}%'`;
  if (category) {
    query += ` AND category = '${category}'`;
  }

  try {
    const results = db.prepare(query).all();

    // INTENTIONAL: search term reflected without encoding (Reflected XSS)
    return res.json({
      query: q,
      message: `Search results for: ${q}`,
      results,
    });
  } catch (err: any) {
    // INTENTIONAL: verbose SQL error returned including the query
    return res.status(500).json({ error: err.message, query });
  }
});

export default router;
