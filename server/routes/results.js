import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  listResults,
  getResult,
  createResult,
  bulkCreateResults,
  updateResult,
  getStudentResults
} from '../controllers/resultController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'TEACHER', 'STUDENT'), listResults);
router.post('/', authorize('ADMIN', 'TEACHER'), createResult);
router.post('/bulk', authorize('ADMIN', 'TEACHER'), bulkCreateResults);
router.get('/:id', authorize('ADMIN', 'TEACHER', 'STUDENT'), getResult);
router.put('/:id', authorize('ADMIN', 'TEACHER'), updateResult);
router.get('/student/:studentId', authorize('ADMIN', 'TEACHER', 'STUDENT'), getStudentResults);

export default router;
