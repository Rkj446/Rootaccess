import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (user) => {
  if (!env.jwtSecret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);
