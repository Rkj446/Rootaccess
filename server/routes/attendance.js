import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  listAttendance,
  createAttendance,
  bulkCreateAttendance,
  updateAttendance,
  getStudentAttendanceSummary
} from '../controllers/attendanceController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'TEACHER', 'STUDENT'), listAttendance);
router.post('/', authorize('ADMIN', 'TEACHER'), createAttendance);
router.post('/bulk', authorize('ADMIN', 'TEACHER'), bulkCreateAttendance);
router.put('/:id', authorize('ADMIN', 'TEACHER'), updateAttendance);
router.get('/student/:studentId/summary', authorize('ADMIN', 'TEACHER', 'STUDENT'), getStudentAttendanceSummary);

export default router;
