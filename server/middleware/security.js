import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const securityMiddleware = (app) => {
  app.use(helmet());
  const allowedOrigins = new Set([
    env.clientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ]);

  const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.has(origin)) return true;
    try {
      const url = new URL(origin);
      return ['localhost', '127.0.0.1'].includes(url.hostname) && /^517[0-9]$/.test(url.port || '5173');
    } catch {
      return false;
    }
  };

  app.use(cors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
  }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }));
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
};
