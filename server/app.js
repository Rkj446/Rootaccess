import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabaseState } from './config/db.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import importRoutes from './routes/imports.js';
import teacherRoutes from './routes/teachers.js';
import classRoutes from './routes/classes.js';
import subjectRoutes from './routes/subjects.js';
import assignmentRoutes from './routes/assignments.js';
import attendanceRoutes from './routes/attendance.js';
import examRoutes from './routes/exams.js';
import resultRoutes from './routes/results.js';
import analyticsRoutes from './routes/analytics.js';
import mlRoutes from './routes/ml.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { securityMiddleware } from './middleware/security.js';

const app = express();
const profileImagesDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads', 'profile-images');
securityMiddleware(app);
app.use(express.json({ limit: '1mb' }));
app.use('/uploads/profile-images', express.static(profileImagesDirectory, {
  dotfiles: 'deny',
  fallthrough: true,
  index: false,
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));
app.get('/', (req, res) => res.json({ name: 'EduTrack by Rootaccess API', status: 'ok' }));
app.get('/api/health', (req, res) => res.json({
  success: true,
  message: 'EduTrack by Rootaccess API is healthy',
  database: getDatabaseState(),
}));
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/imports', importRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ml', mlRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
