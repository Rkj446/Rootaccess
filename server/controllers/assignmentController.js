import TeachingAssignment from '../models/TeachingAssignment.js';
import User from '../models/User.js';
import AcademicClass from '../models/AcademicClass.js';
import Subject from '../models/Subject.js';

export const listAssignments = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const filter = {};
    if (req.query.teacherId) filter.teacherId = req.query.teacherId;
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;

    if (req.user.role === 'TEACHER') {
      filter.teacherId = req.user._id;
    }

    const [assignments, total] = await Promise.all([
      TeachingAssignment.find(filter)
        .populate('teacherId', 'name email')
        .populate('classId', 'name section department')
        .populate('subjectId', 'subjectCode subjectName')
        .sort({ academicYear: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      TeachingAssignment.countDocuments(filter)
    ]);

    res.json({
      success: true,
      message: 'Assignments retrieved',
      data: {
        assignments,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignment = async (req, res, next) => {
  try {
    const assignment = await TeachingAssignment.findById(req.params.id)
      .populate('teacherId', 'name email')
      .populate('classId', 'name section department')
      .populate('subjectId', 'subjectCode subjectName');

    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found', data: null });

    if (req.user.role === 'TEACHER' && assignment.teacherId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions', data: null });
    }

    res.json({ success: true, message: 'Assignment retrieved', data: { assignment } });
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const { teacherId, classId, subjectId, academicYear, semester } = req.body;
    if (!teacherId || !classId || !subjectId || !academicYear) {
      return res.status(400).json({ success: false, message: 'Teacher, class, subject and academic year are required', data: null });
    }

    const [teacher, academicClass, subject] = await Promise.all([
      User.findOne({ _id: teacherId, role: 'TEACHER' }),
      AcademicClass.findById(classId),
      Subject.findById(subjectId)
    ]);

    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found', data: null });
    if (!academicClass) return res.status(404).json({ success: false, message: 'Class not found', data: null });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found', data: null });

    const existing = await TeachingAssignment.findOne({
      teacherId,
      classId,
      subjectId,
      academicYear
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Assignment already exists for this teacher, class and subject', data: null });
    }

    const assignment = await TeachingAssignment.create({
      teacherId,
      classId,
      subjectId,
      academicYear: academicYear.trim(),
      semester: semester ? Number(semester) : null,
      status: 'ACTIVE'
    });

    const populated = await assignment.populate([
      { path: 'teacherId', select: 'name email' },
      { path: 'classId', select: 'name section department' },
      { path: 'subjectId', select: 'subjectCode subjectName' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment: populated }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const { academicYear, semester } = req.body;
    const updates = {};

    if (academicYear) updates.academicYear = academicYear.trim();
    if (semester !== undefined) updates.semester = semester ? Number(semester) : null;

    const assignment = await TeachingAssignment.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('teacherId', 'name email')
      .populate('classId', 'name section department')
      .populate('subjectId', 'subjectCode subjectName');

    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found', data: null });

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: { assignment }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssignmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status', data: null });
    }

    const assignment = await TeachingAssignment.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('teacherId', 'name email')
      .populate('classId', 'name section department')
      .populate('subjectId', 'subjectCode subjectName');

    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found', data: null });

    res.json({
      success: true,
      message: 'Assignment status updated',
      data: { assignment }
    });
  } catch (error) {
    next(error);
  }
};
