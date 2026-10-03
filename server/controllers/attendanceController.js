import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import mongoose from 'mongoose';
import { findStudentForUser, ownsStudent } from '../utils/studentAccess.js';
import {
  getActiveTeachingAssignments,
  hasActiveTeachingAssignment,
} from '../utils/teachingAccess.js';

export const listAttendance = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const filter = {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.status) filter.status = req.query.status;

    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {};
      if (req.query.dateFrom) filter.date.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filter.date.$lte = new Date(req.query.dateTo);
    }

    if (req.user.role === 'STUDENT') {
      const student = await findStudentForUser(req.user);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found', data: null });
      filter.studentId = student._id;
    }
    if (req.user.role === 'TEACHER') {
      const assignments = await getActiveTeachingAssignments(req.user._id);
      if (!assignments.length) {
        filter._id = null;
      } else {
        filter.$or = await Promise.all(assignments.map(async ({ classId, subjectId }) => ({
          classId,
          subjectId,
          studentId: { $in: await Student.find({ classId }).distinct('_id') },
        })));
      }
    }

    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate('studentId', 'studentId name')
        .populate('classId', 'name section')
        .populate('subjectId', 'subjectCode subjectName')
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Attendance.countDocuments(filter)
    ]);

    res.json({
      success: true,
      message: 'Attendance records retrieved',
      data: {
        records,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createAttendance = async (req, res, next) => {
  try {
    const { studentId, classId, subjectId, date, status } = req.body;
    if (!studentId || !classId || !subjectId || !date || !status) {
      return res.status(400).json({ success: false, message: 'All fields are required', data: null });
    }

    if (!['PRESENT', 'ABSENT', 'LATE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status', data: null });
    }

    if (req.user.role === 'TEACHER') {
      const assignment = await hasActiveTeachingAssignment(req.user._id, classId, subjectId);
      if (!assignment) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this class and subject', data: null });
      }
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found', data: null });
    if (!student.classId || student.classId.toString() !== classId.toString()) {
      return res.status(403).json({ success: false, message: 'Student is not assigned to this class', data: null });
    }

    const existing = await Attendance.findOne({
      studentId,
      subjectId,
      date: new Date(date)
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Attendance already recorded for this date', data: null });
    }

    const attendance = await Attendance.create({
      studentId,
      classId,
      subjectId,
      date: new Date(date),
      status,
      markedBy: req.user._id
    });

    const populated = await attendance.populate([
      { path: 'studentId', select: 'studentId name' },
      { path: 'classId', select: 'name section' },
      { path: 'subjectId', select: 'subjectCode subjectName' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Attendance recorded',
      data: { attendance: populated }
    });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateAttendance = async (req, res, next) => {
  try {
    const { classId, subjectId, date, records } = req.body;
    if (!classId || !subjectId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Class, subject, date and records are required', data: null });
    }

    if (req.user.role === 'TEACHER') {
      const assigned = await hasActiveTeachingAssignment(req.user._id, classId, subjectId);
      if (!assigned) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this class and subject', data: null });
      }
    }

    const parseDate = new Date(date);
    if (Number.isNaN(parseDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid attendance date', data: null });
    }
    const validRecords = records.filter((record) => (
      record.studentId && mongoose.isValidObjectId(record.studentId)
      && ['PRESENT', 'ABSENT', 'LATE'].includes(record.status)
    ));
    if (validRecords.length !== records.length) {
      return res.status(400).json({ success: false, message: 'Each attendance record requires a valid student and status', data: null });
    }
    const studentIds = validRecords.map((record) => new mongoose.Types.ObjectId(record.studentId));
    if (new Set(studentIds.map(String)).size !== studentIds.length) {
      return res.status(400).json({ success: false, message: 'A student may only appear once per attendance batch', data: null });
    }
    const students = await Student.find({ _id: { $in: studentIds } }).select('_id classId').lean();
    if (students.length !== studentIds.length) {
      return res.status(404).json({ success: false, message: 'One or more students were not found', data: null });
    }
    if (students.some((student) => !student.classId || student.classId.toString() !== classId.toString())) {
      return res.status(403).json({ success: false, message: 'All students must be assigned to the selected class', data: null });
    }

    const attendanceRecords = [];

    for (const record of validRecords) {
      const existing = await Attendance.findOne({
        studentId: record.studentId,
        subjectId,
        date: parseDate
      });
      if (!existing) {
        attendanceRecords.push({
          studentId: record.studentId,
          classId,
          subjectId,
          date: parseDate,
          status: record.status,
          markedBy: req.user._id
        });
      }
    }

    const created = await Attendance.insertMany(attendanceRecords);

    res.status(201).json({
      success: true,
      message: `${created.length} attendance records created`,
      data: { count: created.length }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['PRESENT', 'ABSENT', 'LATE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status', data: null });
    }

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found', data: null });
    if (req.user.role === 'TEACHER') {
      const student = await Student.findById(attendance.studentId).select('classId');
      const assigned = await hasActiveTeachingAssignment(req.user._id, attendance.classId, attendance.subjectId);
      if (!student?.classId || student.classId.toString() !== attendance.classId.toString() || !assigned) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this student and subject', data: null });
      }
    }
    attendance.status = status;
    await attendance.save();
    await attendance.populate([
      { path: 'studentId', select: 'studentId name' },
      { path: 'classId', select: 'name section' },
      { path: 'subjectId', select: 'subjectCode subjectName' },
    ]);

    res.json({
      success: true,
      message: 'Attendance updated',
      data: { attendance }
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendanceSummary = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found', data: null });
    if (!ownsStudent(req.user, student)) return res.status(403).json({ success: false, message: 'You can only access your own attendance', data: null });

    let recordFilter = { studentId: student._id };
    if (req.user.role === 'TEACHER') {
      const assignments = await getActiveTeachingAssignments(req.user._id);
      const studentAssignments = assignments.filter((assignment) => (
        student.classId
        && assignment.classId.toString() === student.classId.toString()
      ));
      if (!studentAssignments.length) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this student', data: null });
      }
      recordFilter = {
        studentId: student._id,
        $or: studentAssignments.map(({ classId, subjectId }) => ({ classId, subjectId })),
      };
    }

    const allRecords = await Attendance.find(recordFilter);

    const summary = {
      total: allRecords.length,
      present: allRecords.filter(r => r.status === 'PRESENT').length,
      absent: allRecords.filter(r => r.status === 'ABSENT').length,
      late: allRecords.filter(r => r.status === 'LATE').length,
      percentage: allRecords.length > 0 ? ((allRecords.filter(r => r.status === 'PRESENT').length / allRecords.length) * 100).toFixed(2) : 0
    };

    const bySubject = await Attendance.aggregate([
      { $match: recordFilter },
      {
        $group: {
          _id: '$subjectId',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] } }
        }
      },
      { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subject' } },
      { $unwind: '$subject' }
    ]);

    res.json({
      success: true,
      message: 'Attendance summary retrieved',
      data: { summary, bySubject }
    });
  } catch (error) {
    next(error);
  }
};
