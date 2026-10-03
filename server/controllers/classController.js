import AcademicClass from '../models/AcademicClass.js';
import Student from '../models/Student.js';
import TeachingAssignment from '../models/TeachingAssignment.js';
import { findStudentForUser } from '../utils/studentAccess.js';

export const listClasses = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { section: new RegExp(req.query.search, 'i') },
        { department: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.semester) filter.semester = Number(req.query.semester);

    if (req.user.role === 'STUDENT') {
      const student = await findStudentForUser(req.user);
      filter._id = student?.classId || null;
    } else if (req.user.role === 'TEACHER') {
      const classIds = await TeachingAssignment.distinct('classId', {
        teacherId: req.user._id,
        status: 'ACTIVE',
      });
      filter._id = { $in: classIds };
    }

    const [classes, total] = await Promise.all([
      AcademicClass.find(filter)
        .sort({ academicYear: -1, semester: 1, name: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AcademicClass.countDocuments(filter)
    ]);

    res.json({
      success: true,
      message: 'Classes retrieved',
      data: {
        classes,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getClass = async (req, res, next) => {
  try {
    const academicClass = await AcademicClass.findById(req.params.id);
    if (!academicClass) return res.status(404).json({ success: false, message: 'Class not found', data: null });
    if (req.user.role === 'STUDENT') {
      const student = await findStudentForUser(req.user);
      if (!student || student.classId?.toString() !== academicClass._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only access your own class', data: null });
      }
    }
    if (req.user.role === 'TEACHER' && !await TeachingAssignment.exists({
      teacherId: req.user._id,
      classId: academicClass._id,
      status: 'ACTIVE',
    })) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this class', data: null });
    }
    res.json({ success: true, message: 'Class retrieved', data: { class: academicClass } });
  } catch (error) {
    next(error);
  }
};

export const listClassStudents = async (req, res, next) => {
  try {
    const academicClass = await AcademicClass.findById(req.params.id);
    if (!academicClass) return res.status(404).json({ success: false, message: 'Class not found', data: null });

    if (req.user.role === 'STUDENT') {
      const student = await findStudentForUser(req.user);
      if (!student || student.classId?.toString() !== academicClass._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only access your own class', data: null });
      }
    }
    if (req.user.role === 'TEACHER') {
      const assignment = await TeachingAssignment.exists({ teacherId: req.user._id, classId: academicClass._id, status: 'ACTIVE' });
      if (!assignment) return res.status(403).json({ success: false, message: 'You are not assigned to this class', data: null });
    }

    const students = req.user.role === 'STUDENT'
      ? [await findStudentForUser(req.user)]
      : await Student.find({ classId: academicClass._id }).sort({ studentId: 1 });
    res.json({ success: true, message: 'Class students retrieved', data: { class: academicClass, students } });
  } catch (error) { next(error); }
};

export const assignStudentToClass = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ success: false, message: 'Student ID is required', data: null });

    const academicClass = await AcademicClass.findById(req.params.id);
    const student = /^[0-9a-f]{24}$/i.test(studentId)
      ? await Student.findById(studentId)
      : await Student.findOne({ studentId });
    if (!academicClass) return res.status(404).json({ success: false, message: 'Class not found', data: null });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found', data: null });

    student.classId = academicClass._id;
    await student.save();
    res.json({ success: true, message: 'Student assigned to class', data: { student } });
  } catch (error) { next(error); }
};

export const createClass = async (req, res, next) => {
  try {
    const { name, section, department, semester, academicYear } = req.body;
    if (!name || !department || !academicYear) {
      return res.status(400).json({ success: false, message: 'Name, department and academic year are required', data: null });
    }

    const academicClass = await AcademicClass.create({
      name: name.trim(),
      section: section?.trim(),
      department: department.trim(),
      semester: Number(semester) || null,
      academicYear: academicYear.trim(),
      status: 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: { class: academicClass }
    });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const { name, section, department, semester, academicYear } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (section !== undefined) updates.section = section?.trim();
    if (department) updates.department = department.trim();
    if (semester !== undefined) updates.semester = semester ? Number(semester) : null;
    if (academicYear) updates.academicYear = academicYear.trim();

    const academicClass = await AcademicClass.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!academicClass) return res.status(404).json({ success: false, message: 'Class not found', data: null });

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: { class: academicClass }
    });
  } catch (error) {
    next(error);
  }
};

export const updateClassStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status', data: null });
    }

    const academicClass = await AcademicClass.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!academicClass) return res.status(404).json({ success: false, message: 'Class not found', data: null });

    res.json({
      success: true,
      message: 'Class status updated',
      data: { class: academicClass }
    });
  } catch (error) {
    next(error);
  }
};
