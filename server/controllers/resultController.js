import Result from '../models/Result.js';
import Exam from '../models/Exam.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import mongoose from 'mongoose';
import { findStudentForUser, ownsStudent } from '../utils/studentAccess.js';
import {
  getActiveTeachingAssignments,
  hasActiveTeachingAssignment,
} from '../utils/teachingAccess.js';

export const listResults = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const filter = {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;

    if (req.user.role === 'STUDENT') {
      const student = await findStudentForUser(req.user);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found', data: null });
      filter.studentId = student._id;
    }

    if (req.user.role === 'TEACHER') {
      const assignments = await getActiveTeachingAssignments(req.user._id);
      const teacherExamScopes = await Promise.all(assignments.map(async ({ classId, subjectId }) => ({
        subjectId,
        examId: {
          $in: await Exam.find({ classId, subjectId }).distinct('_id'),
        },
        studentId: {
          $in: await Student.find({ classId }).distinct('_id'),
        },
      })));
      if (!teacherExamScopes.length) {
        filter._id = null;
      } else {
        filter.$and = [...(filter.$and || []), { $or: teacherExamScopes }];
      }
    }

    const [results, total] = await Promise.all([
      Result.find(filter)
        .populate('studentId', 'studentId name')
        .populate('examId', 'name examType examDate')
        .populate('subjectId', 'subjectCode subjectName')
        .populate('enteredBy', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Result.countDocuments(filter)
    ]);

    res.json({
      success: true,
      message: 'Results retrieved',
      data: {
        results,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('studentId', 'studentId name classId')
      .populate('examId', 'name examType examDate classId subjectId')
      .populate('subjectId', 'subjectCode subjectName')
      .populate('enteredBy', 'name');

    if (!result) return res.status(404).json({ success: false, message: 'Result not found', data: null });
    if (!ownsStudent(req.user, result.studentId)) {
      return res.status(403).json({ success: false, message: 'You can only access your own results', data: null });
    }
    if (req.user.role === 'TEACHER') {
      const studentClassId = result.studentId?.classId;
      const examClassId = result.examId?.classId;
      const resultSubjectId = result.subjectId?._id || result.subjectId;
      const examSubjectId = result.examId?.subjectId?._id || result.examId?.subjectId;
      const assigned = await hasActiveTeachingAssignment(req.user._id, examClassId, resultSubjectId);
      if (
        !studentClassId
        || studentClassId.toString() !== examClassId?.toString()
        || examSubjectId?.toString() !== resultSubjectId?.toString()
        || !assigned
      ) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this student and subject', data: null });
      }
    }
    res.json({ success: true, message: 'Result retrieved', data: { result } });
  } catch (error) {
    next(error);
  }
};

export const createResult = async (req, res, next) => {
  try {
    const { studentId, examId, subjectId, marksObtained, totalMarks, remarks } = req.body;
    if (!studentId || !examId || !subjectId || marksObtained === undefined || !totalMarks) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided', data: null });
    }

    if (marksObtained < 0 || marksObtained > totalMarks) {
      return res.status(400).json({ success: false, message: 'Marks must be between 0 and total marks', data: null });
    }

    const [student, exam, subject] = await Promise.all([
      Student.findById(studentId),
      Exam.findById(examId),
      Subject.findById(subjectId)
    ]);

    if (!student) return res.status(404).json({ success: false, message: 'Student not found', data: null });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found', data: null });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found', data: null });
    if (exam.subjectId.toString() !== subject._id.toString()) {
      return res.status(400).json({ success: false, message: 'Subject does not match the exam', data: null });
    }
    if (!student.classId || student.classId.toString() !== exam.classId.toString()) {
      return res.status(403).json({ success: false, message: 'Student is not assigned to the exam class', data: null });
    }

    if (req.user.role === 'TEACHER') {
      const assigned = await hasActiveTeachingAssignment(req.user._id, exam.classId, subject._id);
      if (!assigned) {
        return res.status(403).json({ success: false, message: 'You are not assigned to enter marks for this exam', data: null });
      }
    }

    const existing = await Result.findOne({ studentId, examId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Result already exists for this student and exam', data: null });
    }

    const result = await Result.create({
      studentId,
      examId,
      subjectId,
      marksObtained: Number(marksObtained),
      totalMarks: Number(totalMarks),
      remarks: remarks?.trim(),
      enteredBy: req.user._id
    });

    const populated = await result.populate([
      { path: 'studentId', select: 'studentId name' },
      { path: 'examId', select: 'name examType examDate' },
      { path: 'subjectId', select: 'subjectCode subjectName' },
      { path: 'enteredBy', select: 'name' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Result created successfully',
      data: { result: populated }
    });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateResults = async (req, res, next) => {
  try {
    const { examId, subjectId, results: resultRecords } = req.body;
    if (!examId || !subjectId || !Array.isArray(resultRecords) || resultRecords.length === 0) {
      return res.status(400).json({ success: false, message: 'Exam, subject and results are required', data: null });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found', data: null });
    if (exam.subjectId.toString() !== subjectId.toString()) {
      return res.status(400).json({ success: false, message: 'Subject does not match the exam', data: null });
    }

    if (req.user.role === 'TEACHER') {
      const assigned = await hasActiveTeachingAssignment(req.user._id, exam.classId, subjectId);
      if (!assigned) {
        return res.status(403).json({ success: false, message: 'You are not assigned to enter marks for this exam', data: null });
      }
    }

    const validRecords = resultRecords.map((record) => {
      if (!record.studentId || !mongoose.isValidObjectId(record.studentId)) return null;
      const marks = Number(record.marksObtained);
      if (!Number.isFinite(marks) || marks < 0 || marks > exam.totalMarks) return null;
      return { ...record, studentId: new mongoose.Types.ObjectId(record.studentId), marks };
    });
    if (validRecords.some((record) => !record)) {
      return res.status(400).json({ success: false, message: 'Each result requires a valid student and marks within the exam total', data: null });
    }
    const studentIds = validRecords.map((record) => record.studentId);
    if (new Set(studentIds.map(String)).size !== studentIds.length) {
      return res.status(400).json({ success: false, message: 'A student may only appear once per exam', data: null });
    }
    const students = await Student.find({ _id: { $in: studentIds } }).select('_id classId').lean();
    if (students.length !== studentIds.length) {
      return res.status(404).json({ success: false, message: 'One or more students were not found', data: null });
    }
    if (students.some((student) => !student.classId || student.classId.toString() !== exam.classId.toString())) {
      return res.status(403).json({ success: false, message: 'All students must be assigned to the exam class', data: null });
    }

    const toCreate = [];
    for (const record of validRecords) {
      const existing = await Result.findOne({ studentId: record.studentId, examId });
      if (!existing) {
        toCreate.push({
          studentId: record.studentId,
          examId,
          subjectId,
          marksObtained: record.marks,
          totalMarks: exam.totalMarks,
          remarks: record.remarks?.trim(),
          enteredBy: req.user._id
        });
      }
    }

    const created = await Result.insertMany(toCreate);

    res.status(201).json({
      success: true,
      message: `${created.length} results created`,
      data: { count: created.length }
    });
  } catch (error) {
    next(error);
  }
};

export const updateResult = async (req, res, next) => {
  try {
    const { marksObtained, remarks } = req.body;
    const updates = {};

    if (marksObtained !== undefined) updates.marksObtained = Number(marksObtained);
    if (remarks !== undefined) updates.remarks = remarks?.trim();

    const result = await Result.findById(req.params.id).populate('studentId', 'classId');

    if (!result) return res.status(404).json({ success: false, message: 'Result not found', data: null });
    const exam = await Exam.findById(result.examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found', data: null });
    if (exam.subjectId.toString() !== result.subjectId.toString()) {
      return res.status(400).json({ success: false, message: 'Result subject does not match its exam', data: null });
    }
    if (updates.marksObtained !== undefined && (updates.marksObtained < 0 || updates.marksObtained > exam.totalMarks)) {
      return res.status(400).json({ success: false, message: 'Marks must be between 0 and total marks', data: null });
    }
    if (req.user.role === 'TEACHER') {
      const assigned = await hasActiveTeachingAssignment(req.user._id, exam.classId, result.subjectId);
      if (!assigned || !result.studentId.classId || result.studentId.classId.toString() !== exam.classId.toString()) {
        return res.status(403).json({ success: false, message: 'You are not assigned to enter marks for this student and exam', data: null });
      }
    }
    Object.assign(result, updates);
    await result.save();
    await result.populate([
      { path: 'studentId', select: 'studentId name' },
      { path: 'examId', select: 'name examType examDate' },
      { path: 'subjectId', select: 'subjectCode subjectName' },
      { path: 'enteredBy', select: 'name' },
    ]);

    res.json({
      success: true,
      message: 'Result updated successfully',
      data: { result }
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentResults = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found', data: null });
    if (!ownsStudent(req.user, student)) return res.status(403).json({ success: false, message: 'You can only access your own results', data: null });

    let resultFilter = { studentId };
    if (req.user.role === 'TEACHER') {
      const assignments = await getActiveTeachingAssignments(req.user._id);
      const studentAssignments = assignments.filter((assignment) => (
        student.classId
        && assignment.classId.toString() === student.classId.toString()
      ));
      if (!studentAssignments.length) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this student', data: null });
      }
      const scopes = await Promise.all(studentAssignments.map(async ({ classId, subjectId }) => ({
        subjectId,
        examId: { $in: await Exam.find({ classId, subjectId }).distinct('_id') },
      })));
      resultFilter = { studentId: student._id, $or: scopes };
    } else {
      resultFilter = { studentId: student._id };
    }

    const results = await Result.find(resultFilter)
      .populate('examId', 'name examType totalMarks')
      .populate('subjectId', 'subjectCode subjectName')
      .sort({ createdAt: -1 });

    const subjectWise = await Result.aggregate([
      { $match: resultFilter },
      {
        $group: {
          _id: '$subjectId',
          avgMarks: { $avg: '$marksObtained' },
          avgPercentage: { $avg: '$percentage' },
          examsCount: { $sum: 1 }
        }
      },
      { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subject' } },
      { $unwind: '$subject' }
    ]);

    const overall = await Result.aggregate([
      { $match: resultFilter },
      {
        $group: {
          _id: null,
          avgPercentage: { $avg: '$percentage' },
          totalExams: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Student results retrieved',
      data: {
        results,
        subjectWise,
        overall: overall[0] || { avgPercentage: 0, totalExams: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};
