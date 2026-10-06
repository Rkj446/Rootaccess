import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { bootstrapInitialAdmin } from '../services/authService.js';

try {
  await connectDatabase();
  const result = await bootstrapInitialAdmin();
  console.log(JSON.stringify({ status: result.created ? 'created' : 'skipped', ...result }));
} catch (error) {
  console.error('Admin bootstrap failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
