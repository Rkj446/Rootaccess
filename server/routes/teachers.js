import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  listTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  updateTeacherStatus
} from '../controllers/teacherController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('ADMIN'), listTeachers);
router.post('/', authorize('ADMIN'), createTeacher);
router.get('/:id', authorize('ADMIN', 'TEACHER'), getTeacher);
router.put('/:id', authorize('ADMIN'), updateTeacher);
router.patch('/:id/status', authorize('ADMIN'), updateTeacherStatus);

export default router;
