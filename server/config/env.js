import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cookieName: process.env.AUTH_COOKIE_NAME || 'student_performance_token',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  requireDatabase: process.env.REQUIRE_DATABASE !== 'false',
};
