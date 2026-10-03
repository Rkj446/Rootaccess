import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  examType: { type: String, enum: ['INTERNAL', 'MIDTERM', 'FINAL', 'ASSIGNMENT', 'LAB'], required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  examDate: { type: Date, required: true },
  totalMarks: { type: Number, required: true, min: 1 },
  passingMarks: { type: Number, required: true, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

examSchema.index({ classId: 1, subjectId: 1, examDate: 1 });
examSchema.index({ createdBy: 1 });

export default mongoose.model('Exam', examSchema);
