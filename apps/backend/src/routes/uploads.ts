import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import db from '../db/database';

const router = Router();

// INTENTIONAL: uploads stored in web-accessible directory
const uploadDir = path.join(__dirname, '../../public/uploads');

// INTENTIONAL: no file type restriction, user-supplied filename preserved
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // INTENTIONAL: original filename used without sanitisation
    cb(null, file.originalname);
  },
});

// INTENTIONAL: no MIME type validation, any file accepted
const upload = multer({
  storage,
  // INTENTIONAL: no file size limit
});

// POST /api/upload
// INTENTIONAL: unauthenticated access – no auth middleware
router.post('/', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = `/uploads/${req.file.originalname}`;

  // INTENTIONAL: store prescription without verifying user or prescription validity
  const user = (req as any).user;
  if (user) {
    db.prepare('INSERT INTO prescriptions (userId, filePath) VALUES (?, ?)').run(user.id, filePath);
  }

  return res.json({
    message: 'File uploaded',
    // INTENTIONAL: returns full server path
    path: filePath,
    filename: req.file.originalname,
  });
});

export default router;
