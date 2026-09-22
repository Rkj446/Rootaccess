import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';

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
