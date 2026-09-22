import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const cookies = Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
      const [key, ...value] = part.trim().split('=');
      return [key, decodeURIComponent(value.join('='))];
    }));
    const token = header?.startsWith('Bearer ') ? header.slice(7) : cookies[env.cookieName];
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required', data: null });
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User no longer exists', data: null });
    if (req.user.status !== 'ACTIVE') return res.status(403).json({ success: false, message: 'Account is inactive', data: null });
    next();
  } catch (error) {
    next(Object.assign(new Error('Invalid or expired token'), { statusCode: 401, cause: error }));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions', data: null });
  }
  next();
};
