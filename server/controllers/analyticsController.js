import mongoose from 'mongoose';
import { once } from 'node:events';
import Student from '../models/Student.js';
import User from '../models/User.js';
import AcademicClass from '../models/AcademicClass.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import TeachingAssignment from '../models/TeachingAssignment.js';
import { findStudentForUser } from '../utils/studentAccess.js';

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const percentage = (part, total) => {
  if (!total) return 0;
  return (part / total) * 100;
};

const toObjectId = (value, field) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw Object.assign(new Error(`Invalid ${field}`), { statusCode: 400 });
  }
  return new mongoose.Types.ObjectId(value);
};

const getAuthorizedTeacherClasses = async (user) => {
  if (!user || user.role !== 'TEACHER') return [];
  return TeachingAssignment.find({ teacherId: user._id, status: 'ACTIVE' }).distinct('classId');
};

const buildStudentFilter = async (req, { allowSelf = true } = {}) => {
  const filter = {};

  if (req.query.major) filter.major = req.query.major;
  if (req.query.classId) filter.classId = toObjectId(req.query.classId, 'classId');
  if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;
  if (req.query.performanceCategory) filter.performanceCategory = req.query.performanceCategory;

  if (req.user.role === 'STUDENT' && allowSelf) {
    const student = await findStudentForUser(req.user);
    if (!student) {
      filter._id = null;
      return { filter, student: null };
    }
    filter._id = student._id;
    return { filter, student };
  }

  if (req.user.role === 'TEACHER') {
    const classIds = await getAuthorizedTeacherClasses(req.user);
    if (!classIds.length) {
      filter._id = null;
      return { filter, student: null };
    }
    filter.classId = { $in: classIds };
  }

  return { filter, student: null };
};

const buildAttendanceFilter = async (req) => {
  const filter = {};

  if (req.query.classId) filter.classId = toObjectId(req.query.classId, 'classId');
  if (req.query.subjectId) filter.subjectId = toObjectId(req.query.subjectId, 'subjectId');

  if (req.query.dateFrom || req.query.dateTo) {
    filter.date = {};
    if (req.query.dateFrom) {
      filter.date.$gte = new Date(req.query.dateFrom);
      if (Number.isNaN(filter.date.$gte.getTime())) throw Object.assign(new Error('Invalid dateFrom'), { statusCode: 400 });
    }
    if (req.query.dateTo) {
      const endDate = new Date(req.query.dateTo);
      if (Number.isNaN(endDate.getTime())) throw Object.assign(new Error('Invalid dateTo'), { statusCode: 400 });
      endDate.setHours(23, 59, 59, 999);
      filter.date.$lte = endDate;
    }
    if (filter.date.$gte && filter.date.$lte && filter.date.$gte > filter.date.$lte) {
      throw Object.assign(new Error('dateFrom must be on or before dateTo'), { statusCode: 400 });
    }
  }

  if (req.user.role === 'STUDENT') {
    const student = await findStudentForUser(req.user);
    filter.studentId = student ? student._id : null;
    return filter;
  }

  if (req.user.role === 'TEACHER') {
    const classIds = await getAuthorizedTeacherClasses(req.user);
    if (!classIds.length) return { studentId: null };
    filter.classId = { $in: classIds };
  }

  return filter;
};

const buildResultFilter = async (req) => {
  const filter = {};

  if (req.query.subjectId) filter.subjectId = toObjectId(req.query.subjectId, 'subjectId');
  if (req.query.classId) {
    const exams = await Exam.find({ classId: req.query.classId }).distinct('_id');
    filter.examId = { $in: exams };
  }

  if (req.user.role === 'STUDENT') {
    const student = await findStudentForUser(req.user);
    filter.studentId = student ? student._id : null;
    return filter;
  }

  if (req.user.role === 'TEACHER') {
    const classIds = await getAuthorizedTeacherClasses(req.user);
    if (!classIds.length) return { studentId: null };
    const exams = await Exam.find({ classId: { $in: classIds } }).distinct('_id');
    filter.examId = { $in: exams };
  }

  return filter;
};

export const overview = async (req, res, next) => {
  try {
    const { filter } = await buildStudentFilter(req, { allowSelf: true });
    const teacherAssignments = req.user.role === 'TEACHER'
      ? await TeachingAssignment.find({ teacherId: req.user._id, status: 'ACTIVE' }).select('classId subjectId').lean()
      : [];
    const classIds = teacherAssignments.map((assignment) => assignment.classId);
    const subjectIds = teacherAssignments.map((assignment) => assignment.subjectId);
    const [studentSummary, teacherCount, classCount, subjectCount, riskSummary] = await Promise.all([
      Student.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            averageAttendance: { $avg: '$attendancePct' },
            averageCgpa: { $avg: '$finalCgpa' },
            averageFinalScore: { $avg: '$finalScore' },
            averageStudyHours: { $avg: '$studyHoursPerDay' },
            totalBacklogs: { $sum: { $ifNull: ['$backlogs', 0] } },
          },
        },
      ]),
      req.user.role === 'ADMIN' ? User.countDocuments({ role: 'TEACHER', status: 'ACTIVE' }) : req.user.role === 'TEACHER' ? 1 : 0,
      req.user.role === 'ADMIN'
        ? AcademicClass.countDocuments({ status: 'ACTIVE' })
        : req.user.role === 'TEACHER' ? AcademicClass.countDocuments({ _id: { $in: classIds }, status: 'ACTIVE' }) : 0,
      req.user.role === 'ADMIN'
        ? Subject.countDocuments({ status: 'ACTIVE' })
        : req.user.role === 'TEACHER' ? Subject.countDocuments({ _id: { $in: subjectIds }, status: 'ACTIVE' }) : 0,
      Student.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            lowRisk: { $sum: { $cond: [{ $eq: [{ $toLower: '$riskLevel' }, 'low'] }, 1, 0] } },
            mediumRisk: { $sum: { $cond: [{ $eq: [{ $toLower: '$riskLevel' }, 'medium'] }, 1, 0] } },
            highRisk: { $sum: { $cond: [{ $eq: [{ $toLower: '$riskLevel' }, 'high'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const summary = studentSummary[0] || {
      totalStudents: 0,
      averageAttendance: 0,
      averageCgpa: 0,
      averageFinalScore: 0,
      averageStudyHours: 0,
      totalBacklogs: 0,
    };
    const riskCounts = riskSummary[0] || { lowRisk: 0, mediumRisk: 0, highRisk: 0 };

    return res.json({
      success: true,
      message: 'Overview analytics retrieved',
      data: {
        totalStudents: summary.totalStudents,
        totalTeachers: teacherCount,
        totalClasses: classCount,
        totalSubjects: subjectCount,
        averageAttendance: toNumber(summary.averageAttendance),
        averageCgpa: toNumber(summary.averageCgpa),
        averageFinalScore: toNumber(summary.averageFinalScore),
        averageStudyHours: toNumber(summary.averageStudyHours),
        totalBacklogs: toNumber(summary.totalBacklogs),
        highRiskStudentCount: riskCounts.highRisk,
        mediumRiskStudentCount: riskCounts.mediumRisk,
        lowRiskStudentCount: riskCounts.lowRisk,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const performanceDistribution = async (req, res, next) => {
  try {
    const { filter } = await buildStudentFilter(req, { allowSelf: true });
    const values = await Student.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $ifNull: ['$performanceCategory', 'Uncategorized'] },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, category: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);

    return res.json({ success: true, message: 'Performance distribution retrieved', data: { distribution: values } });
  } catch (error) {
    next(error);
  }
};

export const riskDistribution = async (req, res, next) => {
  try {
    const { filter } = await buildStudentFilter(req, { allowSelf: true });
    const values = await Student.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $ifNull: ['$riskLevel', 'Unknown'] },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, riskLevel: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);

    return res.json({ success: true, message: 'Risk distribution retrieved', data: { distribution: values } });
  } catch (error) {
    next(error);
  }
};

export const byMajor = async (req, res, next) => {
  try {
    const { filter } = await buildStudentFilter(req, { allowSelf: true });
    const values = await Student.aggregate([
      { $match: { ...filter, major: { $nin: [null, ''] } } },
      {
        $group: {
          _id: '$major',
          studentCount: { $sum: 1 },
          averageCgpa: { $avg: '$finalCgpa' },
          averageFinalScore: { $avg: '$finalScore' },
          averageAttendance: { $avg: '$attendancePct' },
          averageStudyHours: { $avg: '$studyHoursPerDay' },
          averageParticipation: { $avg: '$classParticipationPct' },
          highRiskCount: { $sum: { $cond: [{ $eq: [{ $toLower: '$riskLevel' }, 'high'] }, 1, 0] } },
        },
      },
      { $project: { _id: 0, major: '$_id', studentCount: 1, averageCgpa: 1, averageFinalScore: 1, averageAttendance: 1, averageStudyHours: 1, averageParticipation: 1, highRiskCount: 1 } },
      { $sort: { studentCount: -1 } },
    ]);

    return res.json({ success: true, message: 'Major analytics retrieved', data: { majors: values } });
  } catch (error) {
    next(error);
  }
};

export const byClass = async (req, res, next) => {
  try {
    const { filter } = await buildStudentFilter(req, { allowSelf: true });
    const classFilter = { ...filter };
    if (filter.classId) {
      classFilter.$and = [{ classId: { $ne: null } }, { classId: filter.classId }];
      delete classFilter.classId;
    } else {
      classFilter.classId = { $ne: null };
    }

    const values = await Student.aggregate([
      { $match: classFilter },
      {
        $lookup: {
          from: 'academicclasses',
          localField: 'classId',
          foreignField: '_id',
          as: 'academicClass',
        },
      },
      { $unwind: '$academicClass' },
      {
        $group: {
          _id: '$classId',
          totalStudents: { $sum: 1 },
          name: { $first: '$academicClass.name' },
          section: { $first: '$academicClass.section' },
          academicYear: { $first: '$academicClass.academicYear' },
          averageCgpa: { $avg: '$finalCgpa' },
          averageScore: { $avg: '$finalScore' },
          attendance: { $avg: '$attendancePct' },
          highRiskStudents: { $sum: { $cond: [{ $eq: [{ $toLower: '$riskLevel' }, 'high'] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          classId: '$_id',
          className: '$name',
          section: 1,
          academicYear: 1,
          totalStudents: 1,
          averageCgpa: 1,
          averageScore: 1,
          attendance: 1,
          highRiskStudents: 1,
        },
      },
      { $sort: { totalStudents: -1 } },
    ]);

    return res.json({ success: true, message: 'Class analytics retrieved', data: { classes: values } });
  } catch (error) {
    next(error);
  }
};

export const attendanceAnalytics = async (req, res, next) => {
  try {
    const attendanceFilter = await buildAttendanceFilter(req);
    const threshold = Number(req.query.threshold ?? 60);
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
      return res.status(400).json({ success: false, message: 'threshold must be between 0 and 100', data: null });
    }
    const thresholdFilter = {
      attendancePct: { $lt: threshold },
    };
    if (attendanceFilter.classId && req.user.role !== 'TEACHER') {
      thresholdFilter.classId = attendanceFilter.classId;
    }

    if (req.user.role === 'STUDENT') {
      const student = await findStudentForUser(req.user);
      thresholdFilter._id = student ? student._id : null;
    }

    if (req.user.role === 'TEACHER') {
      const classIds = await getAuthorizedTeacherClasses(req.user);
      thresholdFilter.classId = classIds.length
        ? attendanceFilter.classId
          ? classIds.some((classId) => classId.equals(attendanceFilter.classId)) ? attendanceFilter.classId : null
          : { $in: classIds }
        : null;
    }

    const thresholdPage = Math.max(Number(req.query.page) || 1, 1);
    const thresholdLimit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const [overall, classSummary, subjectSummary, statusSummary, thresholdStudents, thresholdTotal] = await Promise.all([
      Attendance.aggregate([
        { $match: attendanceFilter },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            present: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
            late: { $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] } },
          },
        },
      ]),
      Attendance.aggregate([
        { $match: attendanceFilter },
        {
          $lookup: {
            from: 'academicclasses',
            localField: 'classId',
            foreignField: '_id',
            as: 'classDetails',
          },
        },
        { $unwind: '$classDetails' },
        {
          $group: {
            _id: '$classId',
            className: { $first: '$classDetails.name' },
            attendanceRate: { $avg: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 100, 0] } },
            present: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
            late: { $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] } },
          },
        },
        { $project: { _id: 0, classId: '$_id', className: 1, attendanceRate: 1, present: 1, absent: 1, late: 1 } },
        { $sort: { attendanceRate: -1 } },
      ]),
      Attendance.aggregate([
        { $match: attendanceFilter },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subjectDetails',
          },
        },
        { $unwind: '$subjectDetails' },
        {
          $group: {
            _id: '$subjectId',
            subjectName: { $first: '$subjectDetails.subjectName' },
            present: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
            late: { $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] } },
            attendanceRate: { $avg: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 100, 0] } },
          },
        },
        { $project: { _id: 0, subjectId: '$_id', subjectName: 1, present: 1, absent: 1, late: 1, attendanceRate: 1 } },
        { $sort: { attendanceRate: -1 } },
      ]),
      Attendance.aggregate([
        { $match: attendanceFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
      ]),
      Student.aggregate([
        { $match: thresholdFilter },
        { $project: { _id: 0, studentId: 1, name: 1, major: 1, attendancePct: 1, riskLevel: 1 } },
        { $sort: { attendancePct: 1 } },
        { $skip: (thresholdPage - 1) * thresholdLimit },
        { $limit: thresholdLimit },
      ]),
      Student.countDocuments(thresholdFilter),
    ]);

    const summary = overall[0] || { totalRecords: 0, present: 0, absent: 0, late: 0 };
    return res.json({
      success: true,
      message: 'Attendance analytics retrieved',
      data: {
        overallAttendance: percentage(summary.present, summary.totalRecords),
        presentCount: summary.present,
        absentCount: summary.absent,
        lateCount: summary.late,
        classWiseAttendance: classSummary,
        subjectWiseAttendance: subjectSummary,
        statusSummary,
        studentsBelowAttendanceThreshold: thresholdStudents,
        attendanceThresholdPagination: { page: thresholdPage, limit: thresholdLimit, total: thresholdTotal, pages: Math.ceil(thresholdTotal / thresholdLimit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resultAnalytics = async (req, res, next) => {
  try {
    const resultFilter = await buildResultFilter(req);
    const [summary, grades, highestMarks, lowestMarks, subjectAverages, classAverages] = await Promise.all([
      Result.aggregate([
        { $match: resultFilter },
        {
          $group: {
            _id: null,
            averageMarks: { $avg: '$percentage' },
            passCount: { $sum: { $cond: [{ $gte: ['$percentage', 50] }, 1, 0] } },
            failCount: { $sum: { $cond: [{ $lt: ['$percentage', 50] }, 1, 0] } },
            highestMarks: { $max: '$marksObtained' },
            lowestMarks: { $min: '$marksObtained' },
          },
        },
      ]),
      Result.aggregate([
        { $match: resultFilter },
        { $group: { _id: '$grade', count: { $sum: 1 } } },
        { $project: { _id: 0, grade: '$_id', count: 1 } },
      ]),
      Result.find(resultFilter).sort({ marksObtained: -1 }).limit(1).lean(),
      Result.find(resultFilter).sort({ marksObtained: 1 }).limit(1).lean(),
      Result.aggregate([
        { $match: resultFilter },
        { $group: { _id: '$subjectId', averagePercentage: { $avg: '$percentage' }, resultCount: { $sum: 1 } } },
        { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subject' } },
        { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, subjectId: '$_id', subjectName: '$subject.subjectName', averagePercentage: 1, resultCount: 1 } },
        { $sort: { subjectName: 1 } },
      ]),
      Result.aggregate([
        { $match: resultFilter },
        { $lookup: { from: 'exams', localField: 'examId', foreignField: '_id', as: 'exam' } },
        { $unwind: '$exam' },
        { $group: { _id: '$exam.classId', averagePercentage: { $avg: '$percentage' }, resultCount: { $sum: 1 } } },
        { $lookup: { from: 'academicclasses', localField: '_id', foreignField: '_id', as: 'academicClass' } },
        { $unwind: { path: '$academicClass', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, classId: '$_id', className: '$academicClass.name', averagePercentage: 1, resultCount: 1 } },
        { $sort: { className: 1 } },
      ]),
    ]);

    const stats = summary[0] || { averageMarks: 0, passCount: 0, failCount: 0, highestMarks: 0, lowestMarks: 0 };
    const toGradeSummary = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    grades.forEach((grade) => {
      if (toGradeSummary[grade.grade] !== undefined) toGradeSummary[grade.grade] = grade.count;
    });

    return res.json({
      success: true,
      message: 'Result analytics retrieved',
      data: {
        examAverage: toNumber(stats.averageMarks),
        highestMarks: highestMarks[0]?.marksObtained || 0,
        lowestMarks: lowestMarks[0]?.marksObtained || 0,
        passCount: stats.passCount,
        failCount: stats.failCount,
        gradeDistribution: toGradeSummary,
        subjectAverage: subjectAverages,
        classAverage: classAverages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const rankings = async (req, res, next) => {
  try {
    const { filter } = await buildStudentFilter(req, { allowSelf: true });
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const scope = req.query.scope || 'overall';
    if (!['overall', 'class', 'major'].includes(scope)) {
      return res.status(400).json({ success: false, message: 'Invalid ranking scope', data: null });
    }
    if (scope === 'class' && !req.query.classId) {
      return res.status(400).json({ success: false, message: 'classId is required for class rankings', data: null });
    }
    if (scope === 'major' && !req.query.major) {
      return res.status(400).json({ success: false, message: 'major is required for major rankings', data: null });
    }

    const [overall, total] = await Promise.all([
      Student.aggregate([
        { $match: filter },
        { $setWindowFields: { sortBy: { finalCgpa: -1 }, output: { rank: { $rank: {} } } } },
        { $sort: { finalCgpa: -1, studentId: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $project: { studentId: 1, name: 1, classId: 1, major: 1, finalCgpa: 1, finalScore: 1, attendancePct: 1, riskLevel: 1, rank: 1 } },
      ]),
      Student.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      message: 'Student rankings retrieved',
      data: {
        metric: 'Final CGPA',
        scope,
        overall,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const atRiskStudents = async (req, res, next) => {
  try {
    const { filter } = await buildStudentFilter(req, { allowSelf: true });
    const riskFilter = { ...filter, riskLevel: { $in: ['High', 'Medium', 'high', 'medium'] } };
    if (req.query.riskLevel) riskFilter.riskLevel = req.query.riskLevel;
    if (req.query.major) riskFilter.major = req.query.major;
    if (req.query.classId && req.user.role !== 'TEACHER') riskFilter.classId = toObjectId(req.query.classId, 'classId');
    if (req.query.minAttendance) {
      const minimumAttendance = Number(req.query.minAttendance);
      if (!Number.isFinite(minimumAttendance) || minimumAttendance < 0 || minimumAttendance > 100) {
        return res.status(400).json({ success: false, message: 'minAttendance must be between 0 and 100', data: null });
      }
      riskFilter.attendancePct = { $lte: minimumAttendance };
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const [students, total] = await Promise.all([
      Student.find(riskFilter).sort({ riskLevel: 1, finalCgpa: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Student.countDocuments(riskFilter),
    ]);
    return res.json({
      success: true,
      message: 'At-risk students retrieved',
      data: { students: students.map((student) => ({
        studentId: student.studentId,
        major: student.major,
        attendance: student.attendancePct,
        cgpa: student.finalCgpa,
        finalScore: student.finalScore,
        backlogs: student.backlogs,
        riskLevel: student.riskLevel,
      })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
};

export const topPerformers = async (req, res, next) => {
  try {
    const { filter } = await buildStudentFilter(req, { allowSelf: true });
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const students = await Student.find(filter).sort({ finalCgpa: -1, finalScore: -1 }).limit(limit).lean();
    return res.json({
      success: true,
      message: 'Top performers retrieved',
      data: { students: students.map((student) => ({
        studentId: student.studentId,
        cgpa: student.finalCgpa,
        finalScore: student.finalScore,
        attendance: student.attendancePct,
        major: student.major,
        classId: student.classId,
      })) },
    });
  } catch (error) {
    next(error);
  }
};

export const correlations = async (req, res, next) => {
  try {
    const { filter } = await buildStudentFilter(req, { allowSelf: true });
    const pairs = [
      { label: 'Attendance vs Final Score', x: 'attendancePct', y: 'finalScore' },
      { label: 'Study Hours vs Final Score', x: 'studyHoursPerDay', y: 'finalScore' },
      { label: 'Previous CGPA vs Final CGPA', x: 'previousCgpa', y: 'finalCgpa' },
      { label: 'Participation vs Final Score', x: 'classParticipationPct', y: 'finalScore' },
      { label: 'Backlogs vs Final CGPA', x: 'backlogs', y: 'finalCgpa' },
      { label: 'Sleep Hours vs Final Score', x: 'sleepHoursPerDay', y: 'finalScore' },
    ];
    const accumulators = {};
    pairs.forEach(({ x, y }, index) => {
      const valid = { $and: [{ $isNumber: `$${x}` }, { $isNumber: `$${y}` }] };
      const sum = (field) => ({ $sum: { $cond: [valid, `$${field}`, 0] } });
      accumulators[`count${index}`] = { $sum: { $cond: [valid, 1, 0] } };
      accumulators[`sumX${index}`] = sum(x);
      accumulators[`sumY${index}`] = sum(y);
      accumulators[`sumXX${index}`] = { $sum: { $cond: [valid, { $multiply: [`$${x}`, `$${x}`] }, 0] } };
      accumulators[`sumYY${index}`] = { $sum: { $cond: [valid, { $multiply: [`$${y}`, `$${y}`] }, 0] } };
      accumulators[`sumXY${index}`] = { $sum: { $cond: [valid, { $multiply: [`$${x}`, `$${y}`] }, 0] } };
    });
    const [statistics] = await Student.aggregate([{ $match: filter }, { $group: { _id: null, ...accumulators } }]);
    const correlations = pairs.map((pair, index) => {
      const count = statistics?.[`count${index}`] || 0;
      const sumX = statistics?.[`sumX${index}`] || 0;
      const sumY = statistics?.[`sumY${index}`] || 0;
      const numerator = count * (statistics?.[`sumXY${index}`] || 0) - sumX * sumY;
      const varianceX = count * (statistics?.[`sumXX${index}`] || 0) - sumX * sumX;
      const varianceY = count * (statistics?.[`sumYY${index}`] || 0) - sumY * sumY;
      const denominator = Math.sqrt(Math.max(varianceX, 0) * Math.max(varianceY, 0));
      return { label: pair.label, correlation: denominator ? numerator / denominator : 0, sampleCount: count };
    });

    return res.json({
      success: true,
      message: 'Correlation analytics retrieved',
      data: {
        note: 'Correlation does not imply causation.',
        correlations,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const datasetComparison = async (req, res, next) => {
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Comparison is only available to students.',
        data: null,
      });
    }

    const { student } = await buildStudentFilter(req, { allowSelf: true });
    const comparisonStudent = student || await findStudentForUser(req.user);

    if (!comparisonStudent) {
      return res.status(404).json({ success: false, message: 'Student record not found', data: null });
    }

    const [datasetAverage] = await Student.aggregate([
      {
        $group: {
          _id: null,
          finalCgpa: { $avg: '$finalCgpa' },
          finalScore: { $avg: '$finalScore' },
          attendance: { $avg: '$attendancePct' },
          studyHours: { $avg: '$studyHoursPerDay' },
          participation: { $avg: '$classParticipationPct' },
        },
      },
      { $project: { _id: 0 } },
    ]);
    const averages = datasetAverage || { finalCgpa: 0, finalScore: 0, attendance: 0, studyHours: 0, participation: 0 };

    return res.json({
      success: true,
      message: 'Student comparison retrieved',
      data: {
        studentId: comparisonStudent.studentId,
        comparisons: [
          { label: 'Final CGPA', student: comparisonStudent.finalCgpa, datasetAverage: averages.finalCgpa },
          { label: 'Final Score', student: comparisonStudent.finalScore, datasetAverage: averages.finalScore },
          { label: 'Attendance', student: comparisonStudent.attendancePct, datasetAverage: averages.attendance },
          { label: 'Study Hours', student: comparisonStudent.studyHoursPerDay, datasetAverage: averages.studyHours },
          { label: 'Participation', student: comparisonStudent.classParticipationPct, datasetAverage: averages.participation },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (req, res, next) => {
  try {
    const { type } = req.params;
    const reportType = type || 'overview';
    const { filter } = await buildStudentFilter(req, { allowSelf: true });
    const columns = reportType === 'students'
      ? ['studentId', 'name', 'major', 'finalCgpa', 'finalScore', 'attendancePct', 'riskLevel']
      : ['studentId', 'major', 'finalCgpa', 'finalScore', 'attendancePct', 'riskLevel'];
    const quote = (value) => {
      const text = value === undefined || value === null ? '' : String(value);
      return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const cursor = Student.find(filter).select(columns.join(' ')).sort({ studentId: 1 }).lean().cursor({ batchSize: 1000 });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.csv"`);
    res.write(`${columns.join(',')}\n`);
    let rows = [];
    for await (const student of cursor) {
      rows.push(columns.map((column) => quote(student[column])).join(','));
      if (rows.length === 500) {
        if (!res.write(`${rows.join('\n')}\n`)) await once(res, 'drain');
        rows = [];
      }
    }
    if (rows.length) res.write(`${rows.join('\n')}\n`);
    return res.end();
  } catch (error) {
    next(error);
  }
};
