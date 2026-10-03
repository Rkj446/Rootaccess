import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass', sparse: true, index: true },
  name: { type: String, default: '' },
  age: Number, gender: String, major: String,
  attendancePct: Number, studyHoursPerDay: Number, previousCgpa: Number,
  sleepHoursPerDay: Number, classParticipationPct: Number, backlogs: Number,
  internalMarks: Number, assignmentAvg: Number, midtermMarks: Number,
  labMarks: Number, finalScore: Number, finalCgpa: Number,
  performanceCategory: String, riskLevel: String,
}, { timestamps: true });

studentSchema.index({ major: 1, finalCgpa: -1 });
studentSchema.index({ riskLevel: 1, performanceCategory: 1 });
studentSchema.index({ classId: 1, attendancePct: -1 });

export default mongoose.model('Student', studentSchema);
