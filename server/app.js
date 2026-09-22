import express from 'express';
import { getDatabaseState } from './config/db.js';
import authRoutes from './routes/auth.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { securityMiddleware } from './middleware/security.js';

const app = express();
securityMiddleware(app);
app.use(express.json({ limit: '1mb' }));
app.get('/', (req, res) => res.json({ name: 'Student Performance API', status: 'ok' }));
app.get('/api/health', (req, res) => res.json({
  success: true,
  message: 'Student Performance API is healthy',
  database: getDatabaseState(),
}));
app.use('/api/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
