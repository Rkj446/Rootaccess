import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async () => {
  if (!env.mongoUri) {
    if (env.requireDatabase) throw new Error('MONGODB_URI is required when REQUIRE_DATABASE is enabled.');
    console.warn('MONGODB_URI is not configured; database checks are explicitly disabled.');
    return false;
  }
  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    if (env.requireDatabase) throw error;
    console.warn(`MongoDB unavailable; continuing because REQUIRE_DATABASE=false: ${error.message}`);
    return false;
  }
};

export const getDatabaseState = () => ({
  status: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  name: mongoose.connection.name || null,
});
