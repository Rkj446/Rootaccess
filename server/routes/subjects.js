import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  listSubjects,
  getSubject,
  createSubject,
  updateSubject,
  updateSubjectStatus
} from '../controllers/subjectController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'TEACHER', 'STUDENT'), listSubjects);
router.post('/', authorize('ADMIN'), createSubject);
router.get('/:id', authorize('ADMIN', 'TEACHER', 'STUDENT'), getSubject);
router.put('/:id', authorize('ADMIN'), updateSubject);
router.patch('/:id/status', authorize('ADMIN'), updateSubjectStatus);

export default router;
