import Student from '../models/Student.js';

export const findStudentForUser = async (user) => {
  const byUser = await Student.findOne({ userId: user._id });
  if (byUser) return byUser;
  if (!user.studentId) return null;
  return Student.findOne({ studentId: user.studentId });
};

export const ownsStudent = (user, student) => (
  user.role !== 'STUDENT'
  || student.userId?.toString() === user._id.toString()
  || student.studentId === user.studentId
);