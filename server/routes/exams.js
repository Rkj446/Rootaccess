import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  listExams,
  getExam,
  createExam,
  updateExam,
  updateExamStatus
} from '../controllers/examController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'TEACHER', 'STUDENT'), listExams);
router.post('/', authorize('ADMIN', 'TEACHER'), createExam);
router.get('/:id', authorize('ADMIN', 'TEACHER', 'STUDENT'), getExam);
router.put('/:id', authorize('ADMIN', 'TEACHER'), updateExam);
router.patch('/:id/status', authorize('ADMIN', 'TEACHER'), updateExamStatus);

export default router;
