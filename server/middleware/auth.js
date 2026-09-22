import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });
    const decoded = verifyToken(header.slice(7));
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User no longer exists' });
    next();
  } catch (error) {
    next(Object.assign(new Error('Invalid or expired token'), { statusCode: 401, cause: error }));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};
