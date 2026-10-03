import TeachingAssignment from '../models/TeachingAssignment.js';

export const getActiveTeachingAssignments = (teacherId) => TeachingAssignment.find({
  teacherId,
  status: 'ACTIVE',
}).select('classId subjectId').lean();

export const hasActiveTeachingAssignment = (teacherId, classId, subjectId) => TeachingAssignment.exists({
  teacherId,
  classId,
  subjectId,
  status: 'ACTIVE',
});

export const matchesTeachingAssignment = (assignments, classId, subjectId) => (
  Boolean(classId && subjectId && assignments.some((assignment) => (
    assignment.classId.toString() === classId.toString()
    && assignment.subjectId.toString() === subjectId.toString()
  )))
);
