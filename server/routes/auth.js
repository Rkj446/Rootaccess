import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { login, me, register, logout, forgotPassword, verifyOTP, resetPassword, changePassword, uploadProfileImage, removeProfileImage } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { MAX_PROFILE_IMAGE_BYTES } from '../services/profileImageService.js';

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
const profileImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PROFILE_IMAGE_BYTES, files: 1 },
}).single('profileImage');
const handleProfileImageUpload = (req, res, next) => {
  profileImageUpload(req, res, (error) => {
    if (!error) return next();
    const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return next(Object.assign(new Error(
      error.code === 'LIMIT_FILE_SIZE' ? 'Profile photo must be 5 MB or smaller' : 'Invalid profile photo upload',
    ), { statusCode }));
  });
};

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', passwordResetRequestLimiter, forgotPassword);
router.post('/verify-otp', passwordResetVerifyLimiter, verifyOTP);
router.post('/reset-password', passwordResetVerifyLimiter, resetPassword);
router.put('/change-password', protect, changePassword);
router.put('/profile-image', protect, handleProfileImageUpload, uploadProfileImage);
router.delete('/profile-image', protect, removeProfileImage);
router.get('/me', protect, me);
router.post('/logout', logout);
export default router;
