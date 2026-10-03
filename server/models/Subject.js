import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  subjectCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  subjectName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  semester: { type: Number, min: 1, max: 10 },
  credits: { type: Number, required: true, min: 1, max: 10 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

subjectSchema.index({ department: 1, semester: 1 });

export default mongoose.model('Subject', subjectSchema);
