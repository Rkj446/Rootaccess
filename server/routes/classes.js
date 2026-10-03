import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  listClasses,
  getClass,
  createClass,
  updateClass,
  updateClassStatus,
  listClassStudents,
  assignStudentToClass
} from '../controllers/classController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'TEACHER', 'STUDENT'), listClasses);
router.post('/', authorize('ADMIN'), createClass);
router.get('/:id/students', authorize('ADMIN', 'TEACHER', 'STUDENT'), listClassStudents);
router.put('/:id/students', authorize('ADMIN'), assignStudentToClass);
router.get('/:id', authorize('ADMIN', 'TEACHER', 'STUDENT'), getClass);
router.put('/:id', authorize('ADMIN'), updateClass);
router.patch('/:id/status', authorize('ADMIN'), updateClassStatus);

export default router;
