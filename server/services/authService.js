import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import PasswordResetOTP from '../models/PasswordResetOTP.js';
import { sendPasswordResetOTPEmail } from './emailService.js';
import { signToken } from '../utils/jwt.js';

const OTP_TTL_MS = 10 * 60 * 1000;

export const publicUser = (user) => ({ id: user._id.toString(), name: user.name, email: user.email, role: user.role, status: user.status, studentId: user.studentId || null });

export const register = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw Object.assign(new Error('Email is already registered'), { statusCode: 409 });
  const user = await User.create({ name, email: normalizedEmail, password, role: 'STUDENT' });
  return { user: publicUser(user), token: signToken(user) };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (user && user.status !== 'ACTIVE') throw Object.assign(new Error('Account is inactive'), { statusCode: 403 });
  if (!user || !(await user.comparePassword(password))) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }
  return { user: publicUser(user), token: signToken(user) };
};

const hashOTP = async (otp) => bcrypt.hash(otp, 12);

const cleanActiveResetTokens = async (userId) => {
  await PasswordResetOTP.updateMany({ userId, revokedAt: null, usedAt: null }, { $set: { revokedAt: new Date() } });
};

const createOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString().padStart(6, '0');
  return otp;
};

export const requestPasswordReset = async ({ email, ipAddress, userAgent }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || user.status !== 'ACTIVE') {
    return { sent: false, message: 'If an account exists for this email, a verification code has been sent.' };
  }

  const recentUserAttempts = await PasswordResetOTP.countDocuments({
    userId: user._id,
    createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
  });

  if (recentUserAttempts > 0) {
    throw Object.assign(new Error('Please wait before requesting another password reset code.'), { statusCode: 429 });
  }

  const recentIpAttempts = await PasswordResetOTP.countDocuments({
    requestIp: ipAddress || '',
    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
  });

  if (recentIpAttempts >= 5) {
    throw Object.assign(new Error('Too many password reset requests from this network. Please try again later.'), { statusCode: 429 });
  }

  const otp = createOtp();
  const otpHash = await hashOTP(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await cleanActiveResetTokens(user._id);
  await PasswordResetOTP.create({
    userId: user._id,
    otpHash,
    expiresAt,
    attempts: 0,
    requestIp: ipAddress || '',
    userAgent: userAgent || '',
  });

  const emailResult = await sendPasswordResetOTPEmail({ email: user.email, otp, name: user.name });

  return {
    sent: true,
    message: 'If an account exists for this email, a verification code has been sent.',
    devOtp: emailResult?.devOtp || null,
  };
};

export const verifyPasswordResetOTP = async ({ email, otp }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw Object.assign(new Error('Invalid or expired verification code'), { statusCode: 400 });
  }

  const record = await PasswordResetOTP.findOne({
    userId: user._id,
    revokedAt: null,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    throw Object.assign(new Error('Invalid or expired verification code'), { statusCode: 400 });
  }

  if (record.attempts >= 5) {
    await PasswordResetOTP.updateOne({ _id: record._id }, { $set: { revokedAt: new Date() } });
    throw Object.assign(new Error('Too many failed verification attempts. Request a new code.'), { statusCode: 429 });
  }

  const isMatch = await bcrypt.compare(otp, record.otpHash);
  if (!isMatch) {
    await PasswordResetOTP.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    throw Object.assign(new Error('Invalid or expired verification code'), { statusCode: 400 });
  }

  await PasswordResetOTP.updateOne({ _id: record._id }, { $set: { attempts: record.attempts + 1, usedAt: new Date() } });
  return { verified: true };
};

export const resetPasswordWithOTP = async ({ email, otp, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw Object.assign(new Error('Invalid or expired verification code'), { statusCode: 400 });
  }

  const record = await PasswordResetOTP.findOne({
    userId: user._id,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record || !record.usedAt) {
    throw Object.assign(new Error('Please verify your code before resetting your password'), { statusCode: 400 });
  }

  const isMatch = await bcrypt.compare(otp, record.otpHash);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid or expired verification code'), { statusCode: 400 });
  }

  if (!password || password.length < 8) {
    throw Object.assign(new Error('Password must be at least 8 characters'), { statusCode: 400 });
  }

  user.password = password;
  user.passwordChangedAt = new Date();
  await user.save();

  await PasswordResetOTP.updateMany({ userId: user._id }, { $set: { revokedAt: new Date() } });

  return { success: true, message: 'Password reset successful. Please sign in with your new password.' };
};

