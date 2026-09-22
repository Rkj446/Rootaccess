import { Router } from 'express';
import { listStudents, studentSummary, getMyStudent, getStudent, getPerformance, overview, distribution } from '../controllers/studentController.js';
import importRoutes from './imports.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.use('/import', importRoutes);
router.get('/me', authorize('STUDENT'), getMyStudent);
router.get('/stats/overview', authorize('ADMIN', 'TEACHER'), overview);
router.get('/stats/performance-distribution', authorize('ADMIN', 'TEACHER'), distribution('performanceCategory', 'category'));
router.get('/stats/risk-distribution', authorize('ADMIN', 'TEACHER'), distribution('riskLevel', 'riskLevel'));
router.get('/:id/performance', authorize('ADMIN', 'TEACHER', 'STUDENT'), getPerformance);
router.get('/:id', authorize('ADMIN', 'TEACHER', 'STUDENT'), getStudent);
router.get('/', authorize('ADMIN', 'TEACHER', 'STUDENT'), listStudents);
router.get('/summary', authorize('ADMIN', 'TEACHER', 'STUDENT'), studentSummary);
export default router;
