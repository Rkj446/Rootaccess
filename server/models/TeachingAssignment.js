import mongoose from 'mongoose';

const teachingAssignmentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicClass', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  academicYear: { type: String, required: true, trim: true },
  semester: { type: Number, min: 1, max: 10 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

teachingAssignmentSchema.index({ teacherId: 1, classId: 1, subjectId: 1, academicYear: 1 }, { unique: true });
teachingAssignmentSchema.index({ teacherId: 1, status: 1 });
teachingAssignmentSchema.index({ classId: 1, subjectId: 1 });

export default mongoose.model('TeachingAssignment', teachingAssignmentSchema);
