import { Router } from 'express';
import { authorize, protect } from '../middleware/auth.js';
import { getMLHealth, predictRisk, trainModel, exportTrainingData } from '../controllers/mlController.js';

const router = Router();
router.use(protect);

router.get('/health', authorize('ADMIN', 'TEACHER', 'STUDENT'), getMLHealth);
router.post('/predict/risk', authorize('ADMIN', 'TEACHER', 'STUDENT'), predictRisk);
router.post('/train', authorize('ADMIN'), trainModel);
router.get('/training-data', authorize('ADMIN'), exportTrainingData);

export default router;
