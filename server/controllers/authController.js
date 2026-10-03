import * as authService from '../services/authService.js';
import { env } from '../config/env.js';

const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: env.cookieSecure, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' };
const setAuthCookie = (res, token) => {
  const secure = cookieOptions.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${env.cookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Max-Age=${cookieOptions.maxAge / 1000}; Path=/${secure}`);
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required', data: null });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const result = await authService.register({ name, email, password });
    setAuthCookie(res, result.token);
    delete result.token;
    res.status(201).json({ success: true, message: 'Registration successful', data: result });
  } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required', data: null });
    const result = await authService.login({ email, password });
    setAuthCookie(res, result.token);
    delete result.token;
    res.json({ success: true, message: 'Login successful', data: { user: result.user } });
  } catch (error) { next(error); }
};

export const me = (req, res) => res.json({ success: true, message: 'Authenticated user', data: { user: authService.publicUser(req.user) } });
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: 'An email address is required', data: null });
    }

    const result = await authService.requestPasswordReset({
      email,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    return res.json({
      success: true,
      message: result.message,
      data: result.devOtp ? { otp: result.devOtp } : null,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required', data: null });
    }

    const result = await authService.verifyPasswordResetOTP({ email, otp });
    res.json({ success: true, message: 'Verification code accepted', data: result });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required', data: null });
    }

    const result = await authService.resetPasswordWithOTP({ email, otp, password });
    res.json({ success: true, message: result.message, data: null });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.setHeader('Set-Cookie', `${env.cookieName}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`);
  res.json({ success: true, message: 'Logged out', data: null });
};
