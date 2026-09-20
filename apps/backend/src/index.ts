import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import path from 'path';

import { authRouter } from './routes/auth';
import { projectsRouter } from './routes/projects';
import { bugsRouter } from './routes/bugs';
import { usersRouter } from './routes/users';
import { notificationsRouter } from './routes/notifications';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT ?? 4000;

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:8081',
    credentials: true,
  }),
);

// ─── Static Uploads ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Dhundo API', version: '1.0.0' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/bugs', bugsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/notifications', notificationsRouter);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`🐛 Dhundo API running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
});

export default app;
