import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import authRouter from './routes/auth';
import productsRouter from './routes/products';
import cartRouter from './routes/cart';
import ordersRouter from './routes/orders';
import adminRouter from './routes/admin';
import searchRouter from './routes/search';
import uploadRouter from './routes/uploads';

const app = express();
const PORT = process.env.PORT || 4000;

// INTENTIONAL: CORS set to wildcard – allow all origins
app.use(cors({ origin: '*' }));

// INTENTIONAL: no security headers (no helmet, no CSP, no X-Frame-Options)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// INTENTIONAL: static file serving includes sensitive paths
app.use(express.static(path.join(__dirname, '../public')));
// INTENTIONAL: serves database file at /backup/pharmacy.db
app.use('/backup', express.static(path.join(__dirname, '../database')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/search', searchRouter);
app.use('/api/upload', uploadRouter);

// Serve frontend build in production
const frontendBuild = path.join(__dirname, '../build');
if (fs.existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
}

// INTENTIONAL: verbose error handler leaks stack traces
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: err.message,
    // INTENTIONAL: stack trace exposed in development AND production
    stack: err.stack,
    env: process.env.NODE_ENV,
  });
});

app.listen(PORT, () => {
  console.log(`[IWA-SPA backend] listening on http://localhost:${PORT}`);
  console.log(`[IWA-SPA backend] NODE_ENV=${process.env.NODE_ENV}`);
});

export default app;
