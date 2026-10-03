import { Router } from 'express';
import { authorize, protect } from '../middleware/auth.js';
import {
  overview,
  performanceDistribution,
  riskDistribution,
  byMajor,
  byClass,
  attendanceAnalytics,
  resultAnalytics,
  rankings,
  atRiskStudents,
  topPerformers,
  correlations,
  datasetComparison,
  exportReport,
} from '../controllers/analyticsController.js';

const router = Router();
router.use(protect);

router.get('/overview', authorize('ADMIN', 'TEACHER', 'STUDENT'), overview);
router.get('/performance-distribution', authorize('ADMIN', 'TEACHER', 'STUDENT'), performanceDistribution);
router.get('/risk-distribution', authorize('ADMIN', 'TEACHER', 'STUDENT'), riskDistribution);
router.get('/by-major', authorize('ADMIN', 'TEACHER', 'STUDENT'), byMajor);
router.get('/by-class', authorize('ADMIN', 'TEACHER', 'STUDENT'), byClass);
router.get('/attendance', authorize('ADMIN', 'TEACHER', 'STUDENT'), attendanceAnalytics);
router.get('/results', authorize('ADMIN', 'TEACHER', 'STUDENT'), resultAnalytics);
router.get('/rankings', authorize('ADMIN', 'TEACHER', 'STUDENT'), rankings);
router.get('/at-risk', authorize('ADMIN', 'TEACHER', 'STUDENT'), atRiskStudents);
router.get('/top-performers', authorize('ADMIN', 'TEACHER', 'STUDENT'), topPerformers);
router.get('/correlations', authorize('ADMIN', 'TEACHER', 'STUDENT'), correlations);
router.get('/comparison', authorize('STUDENT'), datasetComparison);
router.get('/report/:type', authorize('ADMIN', 'TEACHER', 'STUDENT'), exportReport);

export default router;
