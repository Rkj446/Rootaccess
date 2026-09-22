import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
  name: { type: String, default: '' },
  age: Number, gender: String, major: String,
  attendancePct: Number, studyHoursPerDay: Number, previousCgpa: Number,
  sleepHoursPerDay: Number, classParticipationPct: Number, backlogs: Number,
  internalMarks: Number, assignmentAvg: Number, midtermMarks: Number,
  labMarks: Number, finalScore: Number, finalCgpa: Number,
  performanceCategory: String, riskLevel: String,
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
