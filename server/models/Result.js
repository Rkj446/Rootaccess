import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  marksObtained: { type: Number, required: true, min: 0 },
  totalMarks: { type: Number, required: true, min: 1 },
  percentage: { type: Number },
  grade: { type: String, trim: true },
  remarks: { type: String, trim: true },
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

resultSchema.index({ studentId: 1, examId: 1 }, { unique: true });
resultSchema.index({ studentId: 1, subjectId: 1 });
resultSchema.index({ examId: 1 });

resultSchema.pre('save', function calculateGrade() {
  if (this.marksObtained !== undefined && this.totalMarks) {
    this.percentage = (this.marksObtained / this.totalMarks) * 100;

    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 80) this.grade = 'A';
    else if (this.percentage >= 70) this.grade = 'B';
    else if (this.percentage >= 60) this.grade = 'C';
    else if (this.percentage >= 50) this.grade = 'D';
    else this.grade = 'F';
  }
});

export default mongoose.model('Result', resultSchema);
