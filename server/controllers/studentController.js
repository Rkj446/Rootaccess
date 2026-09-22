import Student from '../models/Student.js';

const publicStudent = (student) => ({ ...student.toObject(), id: student._id });
const ownFilter = (req) => req.user.role === 'STUDENT'
  ? (req.user.studentId ? { $or: [{ userId: req.user._id }, { studentId: req.user.studentId }] } : { userId: req.user._id })
  : {};
const ensureAccess = (req, id) => req.user.role !== 'STUDENT' || req.user.studentId === id;
const response = (res, data, message = 'Success') => res.json({ success: true, message, data });

export const listStudents = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1); const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const filter = { ...ownFilter(req) };
    if (req.query.search) filter.$or = [{ studentId: new RegExp(req.query.search, 'i') }, { major: new RegExp(req.query.search, 'i') }, { gender: new RegExp(req.query.search, 'i') }];
    if (req.query.major) filter.major = req.query.major;
    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;
    const [students, total] = await Promise.all([Student.find(filter).sort({ studentId: 1 }).skip((page - 1) * limit).limit(limit), Student.countDocuments(filter)]);
    response(res, { students: students.map(publicStudent), pagination: { page, limit, total, pages: Math.ceil(total / limit) } }, 'Students retrieved');
  } catch (error) { next(error); }
};

export const getStudent = async (req, res, next) => {
  try {
    if (!ensureAccess(req, req.params.id)) return res.status(403).json({ success: false, message: 'You can only access your own student record', data: null });
    const student = await Student.findOne({ $or: [{ studentId: req.params.id }, { _id: req.params.id.match(/^[0-9a-f]{24}$/i) ? req.params.id : null }] });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found', data: null });
    response(res, { student: publicStudent(student) }, 'Student retrieved');
  } catch (error) { next(error); }
};

export const getMyStudent = async (req, res, next) => {
  try {
    const student = await Student.findOne(req.user.studentId
      ? { $or: [{ userId: req.user._id }, { studentId: req.user.studentId }] }
      : { userId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found', data: null });
    return response(res, { student: publicStudent(student) }, 'Student retrieved');
  } catch (error) { return next(error); }
};
export const getPerformance = async (req, res, next) => {
  try {
    if (!ensureAccess(req, req.params.id)) return res.status(403).json({ success: false, message: 'Insufficient permissions', data: null });
    const student = await Student.findOne({ studentId: req.params.id }); if (!student) return res.status(404).json({ success: false, message: 'Student not found', data: null });
    response(res, { performance: { finalScore: student.finalScore, finalCgpa: student.finalCgpa, previousCgpa: student.previousCgpa, attendancePct: student.attendancePct, performanceCategory: student.performanceCategory, riskLevel: student.riskLevel, subjectMetrics: [] } }, 'Performance retrieved');
  } catch (error) { next(error); }
};

const aggregateOverview = [{ $group: { _id: null, totalStudents: { $sum: 1 }, averageScore: { $avg: '$finalScore' }, averageCgpa: { $avg: '$finalCgpa' }, averageAttendance: { $avg: '$attendancePct' } } }];
export const overview = async (req, res, next) => { try { const [summary] = await Student.aggregate(aggregateOverview); response(res, { overview: summary || { totalStudents: 0, averageScore: 0, averageCgpa: 0, averageAttendance: 0 } }); } catch (e) { next(e); } };
export const distribution = (field, key) => async (req, res, next) => { try { const values = await Student.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }, { $project: { _id: 0, [key]: '$_id', count: 1 } }, { $sort: { count: -1 } }]); response(res, { distribution: values }); } catch (e) { next(e); } };
export const studentSummary = overview;
