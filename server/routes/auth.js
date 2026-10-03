import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, register, logout, forgotPassword, verifyOTP, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const passwordResetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset attempts. Please try again later.', data: null },
});

const passwordResetVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many verification attempts. Please wait before trying again.', data: null },
});

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', passwordResetRequestLimiter, forgotPassword);
router.post('/verify-otp', passwordResetVerifyLimiter, verifyOTP);
router.post('/reset-password', passwordResetVerifyLimiter, resetPassword);
router.get('/me', protect, me);
router.post('/logout', logout);
export default router;
