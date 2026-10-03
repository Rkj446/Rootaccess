import mongoose from 'mongoose';

const passwordResetOTPSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: '0' } },
  attempts: { type: Number, default: 0 },
  usedAt: { type: Date, default: null },
  revokedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  requestIp: { type: String, default: '' },
  userAgent: { type: String, default: '' },
});

export default mongoose.model('PasswordResetOTP', passwordResetOTPSchema);
