import TeachingAssignment from '../models/TeachingAssignment.js';
import { findStudentForUser } from '../utils/studentAccess.js';
import Subject from '../models/Subject.js';

export const listSubjects = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { subjectCode: new RegExp(req.query.search, 'i') },
        { subjectName: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.semester) filter.semester = Number(req.query.semester);

    if (req.user.role === 'STUDENT') {
      const student = await findStudentForUser(req.user);
      const subjectIds = student?.classId
        ? await TeachingAssignment.distinct('subjectId', {
          classId: student.classId,
          status: 'ACTIVE',
        })
        : [];
      filter._id = { $in: subjectIds };
    } else if (req.user.role === 'TEACHER') {
      const subjectIds = await TeachingAssignment.distinct('subjectId', {
        teacherId: req.user._id,
        status: 'ACTIVE',
      });
      filter._id = { $in: subjectIds };
    }

    const [subjects, total] = await Promise.all([
      Subject.find(filter)
        .sort({ semester: 1, subjectCode: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Subject.countDocuments(filter)
    ]);

    res.json({
      success: true,
      message: 'Subjects retrieved',
      data: {
        subjects,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found', data: null });
    if (req.user.role === 'STUDENT') {
      const student = await findStudentForUser(req.user);
      const assigned = student?.classId && await TeachingAssignment.exists({
        classId: student.classId,
        subjectId: subject._id,
        status: 'ACTIVE',
      });
      if (!assigned) return res.status(403).json({ success: false, message: 'You are not assigned to this subject', data: null });
    }
    if (req.user.role === 'TEACHER' && !await TeachingAssignment.exists({
      teacherId: req.user._id,
      subjectId: subject._id,
      status: 'ACTIVE',
    })) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this subject', data: null });
    }
    res.json({ success: true, message: 'Subject retrieved', data: { subject } });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, department, semester, credits } = req.body;
    if (!subjectCode || !subjectName || !department || !credits) {
      return res.status(400).json({ success: false, message: 'Subject code, name, department and credits are required', data: null });
    }

    const existing = await Subject.findOne({ subjectCode: subjectCode.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Subject code already exists', data: null });
    }

    const subject = await Subject.create({
      subjectCode: subjectCode.toUpperCase().trim(),
      subjectName: subjectName.trim(),
      department: department.trim(),
      semester: semester ? Number(semester) : null,
      credits: Number(credits),
      status: 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: { subject }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, department, semester, credits } = req.body;
    const updates = {};

    if (subjectCode) {
      const existing = await Subject.findOne({ subjectCode: subjectCode.toUpperCase(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Subject code already exists', data: null });
      }
      updates.subjectCode = subjectCode.toUpperCase().trim();
    }
    if (subjectName) updates.subjectName = subjectName.trim();
    if (department) updates.department = department.trim();
    if (semester !== undefined) updates.semester = semester ? Number(semester) : null;
    if (credits !== undefined) updates.credits = Number(credits);

    const subject = await Subject.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found', data: null });

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: { subject }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubjectStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status', data: null });
    }

    const subject = await Subject.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found', data: null });

    res.json({
      success: true,
      message: 'Subject status updated',
      data: { subject }
    });
  } catch (error) {
    next(error);
  }
};
