import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDatabase } from '../config/db.js';
import User from '../models/User.js';

const replaceExisting = process.argv.includes('--replace-existing');

try {
  if (!replaceExisting) {
    throw new Error('Refusing to change an admin without the explicit --replace-existing flag.');
  }
  if (!env.initialAdminEmail || !env.initialAdminPassword) {
    throw new Error('Set INITIAL_ADMIN_EMAIL and a fresh INITIAL_ADMIN_PASSWORD in .env before continuing.');
  }
  if (env.initialAdminPassword.trim().length < 12) {
    throw new Error('INITIAL_ADMIN_PASSWORD must be at least 12 characters.');
  }

  await connectDatabase();

  const admins = await User.find({ role: 'ADMIN' });
  if (admins.length > 1) {
    throw new Error(`Found ${admins.length} admin accounts; refusing to choose one automatically.`);
  }

  const targetUser = await User.findOne({ email: env.initialAdminEmail });
  if (targetUser && targetUser.role !== 'ADMIN') {
    throw new Error('The configured admin email is already assigned to a non-admin account.');
  }

  const admin = admins[0] || new User();
  if (targetUser && targetUser._id.toString() !== admin._id?.toString()) {
    throw new Error('The configured admin email is already assigned to another account.');
  }

  admin.name = 'System Administrator';
  admin.email = env.initialAdminEmail;
  admin.role = 'ADMIN';
  admin.status = 'ACTIVE';
  admin.password = env.initialAdminPassword;
  await admin.save();

  console.log(`System admin is ready for ${admin.email}. Existing account data was preserved.`);
} catch (error) {
  console.error('Admin replacement failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
