import Exam from '../models/Exam.js';
import TeachingAssignment from '../models/TeachingAssignment.js';
import AcademicClass from '../models/AcademicClass.js';
import Subject from '../models/Subject.js';
import { findStudentForUser } from '../utils/studentAccess.js';
import { getActiveTeachingAssignments, hasActiveTeachingAssignment } from '../utils/teachingAccess.js';

export const listExams = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.examType) filter.examType = req.query.examType;
    if (req.query.status) filter.status = req.query.status;

    if (req.user.role === 'TEACHER') {
      const assignments = await getActiveTeachingAssignments(req.user._id);
      if (!assignments.length) {
        filter._id = null;
      } else {
        filter.$or = assignments.map(({ classId, subjectId }) => ({ classId, subjectId }));
      }
    } else if (req.user.role === 'STUDENT') {
      const student = await findStudentForUser(req.user);
      filter.classId = student?.classId || null;
    }

    const [exams, total] = await Promise.all([
      Exam.find(filter)
        .populate('classId', 'name section')
        .populate('subjectId', 'subjectCode subjectName')
        .populate('createdBy', 'name')
        .sort({ examDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Exam.countDocuments(filter)
    ]);

    res.json({
      success: true,
      message: 'Exams retrieved',
      data: {
        exams,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('classId', 'name section')
      .populate('subjectId', 'subjectCode subjectName')
      .populate('createdBy', 'name');

    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found', data: null });
    if (req.user.role === 'TEACHER' && !await hasActiveTeachingAssignment(
      req.user._id,
      exam.classId._id,
      exam.subjectId._id,
    )) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this class and subject', data: null });
    }
    if (req.user.role === 'STUDENT') {
      const student = await findStudentForUser(req.user);
      if (!student?.classId || student.classId.toString() !== exam.classId._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only access exams for your class', data: null });
      }
    }
    res.json({ success: true, message: 'Exam retrieved', data: { exam } });
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const { name, examType, classId, subjectId, examDate, totalMarks, passingMarks } = req.body;
    if (!name || !examType || !classId || !subjectId || !examDate || !totalMarks || passingMarks === undefined) {
      return res.status(400).json({ success: false, message: 'All fields are required', data: null });
    }

    if (!['INTERNAL', 'MIDTERM', 'FINAL', 'ASSIGNMENT', 'LAB'].includes(examType)) {
      return res.status(400).json({ success: false, message: 'Invalid exam type', data: null });
    }

    if (req.user.role === 'TEACHER') {
      const assignment = await hasActiveTeachingAssignment(req.user._id, classId, subjectId);
      if (!assignment) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this class and subject', data: null });
      }
    }

    const academicClass = await AcademicClass.findById(classId);
    if (!academicClass) return res.status(404).json({ success: false, message: 'Class not found', data: null });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found', data: null });

    const exam = await Exam.create({
      name: name.trim(),
      examType,
      classId,
      subjectId,
      examDate: new Date(examDate),
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks),
      createdBy: req.user._id,
      status: 'ACTIVE'
    });

    const populated = await exam.populate([
      { path: 'classId', select: 'name section' },
      { path: 'subjectId', select: 'subjectCode subjectName' },
      { path: 'createdBy', select: 'name' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: { exam: populated }
    });
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const { name, examType, examDate, totalMarks, passingMarks } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (examType) updates.examType = examType;
    if (examDate) updates.examDate = new Date(examDate);
    if (totalMarks !== undefined) updates.totalMarks = Number(totalMarks);
    if (passingMarks !== undefined) updates.passingMarks = Number(passingMarks);

    const exam = await Exam.findById(req.params.id);

    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found', data: null });
    if (req.user.role === 'TEACHER') {
      const assignment = await TeachingAssignment.exists({ teacherId: req.user._id, classId: exam.classId, subjectId: exam.subjectId, status: 'ACTIVE' });
      if (!assignment) return res.status(403).json({ success: false, message: 'You are not assigned to this class and subject', data: null });
    }
    Object.assign(exam, updates);
    await exam.save();
    await exam.populate([
      { path: 'classId', select: 'name section' },
      { path: 'subjectId', select: 'subjectCode subjectName' },
      { path: 'createdBy', select: 'name' },
    ]);

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: { exam }
    });
  } catch (error) {
    next(error);
  }
};

export const updateExamStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status', data: null });
    }

    const exam = await Exam.findById(req.params.id);

    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found', data: null });
    if (req.user.role === 'TEACHER') {
      const assignment = await TeachingAssignment.exists({ teacherId: req.user._id, classId: exam.classId, subjectId: exam.subjectId, status: 'ACTIVE' });
      if (!assignment) return res.status(403).json({ success: false, message: 'You are not assigned to this class and subject', data: null });
    }
    exam.status = status;
    await exam.save();
    await exam.populate([
      { path: 'classId', select: 'name section' },
      { path: 'subjectId', select: 'subjectCode subjectName' },
      { path: 'createdBy', select: 'name' },
    ]);

    res.json({
      success: true,
      message: 'Exam status updated',
      data: { exam }
    });
  } catch (error) {
    next(error);
  }
};
