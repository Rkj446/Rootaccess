import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  updateAssignmentStatus
} from '../controllers/assignmentController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'TEACHER'), listAssignments);
router.post('/', authorize('ADMIN'), createAssignment);
router.get('/:id', authorize('ADMIN', 'TEACHER'), getAssignment);
router.put('/:id', authorize('ADMIN'), updateAssignment);
router.patch('/:id/status', authorize('ADMIN'), updateAssignmentStatus);

export default router;
