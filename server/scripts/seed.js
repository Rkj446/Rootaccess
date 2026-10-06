import mongoose from 'mongoose';
import { env } from '../config/env.js';
import User from '../models/User.js';

if (!env.mongoUri) throw new Error('MONGODB_URI is required');
await mongoose.connect(env.mongoUri);
const users = [
  { name: 'Demo Student', email: 'student@example.com', password: 'student123', role: 'STUDENT', studentId: 'S00001' },
  { name: 'Demo Teacher', email: 'teacher@example.com', password: 'teacher123', role: 'TEACHER' },
];
for (const details of users) {
  let user = await User.findOne({ email: details.email }).select('+password');
  if (!user) user = new User(details);
  else Object.assign(user, details);
  await user.save();
}
await mongoose.disconnect();
console.log('Seeded demo users.');
