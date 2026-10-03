import mongoose from 'mongoose';

const academicClassSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  section: { type: String, trim: true },
  department: { type: String, required: true, trim: true },
  semester: { type: Number, min: 1, max: 10 },
  academicYear: { type: String, required: true, trim: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

academicClassSchema.index({ name: 1, section: 1, academicYear: 1 });

export default mongoose.model('AcademicClass', academicClassSchema);
