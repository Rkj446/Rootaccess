import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

attendanceSchema.index({ studentId: 1, subjectId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ classId: 1, subjectId: 1, date: 1 });
attendanceSchema.index({ studentId: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
