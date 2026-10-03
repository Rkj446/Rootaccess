import User from '../models/User.js';

export const listTeachers = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const filter = { role: 'TEACHER' };
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.status) filter.status = req.query.status;

    const [teachers, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      message: 'Teachers retrieved',
      data: {
        teachers: teachers.map(t => ({ id: t._id, name: t.name, email: t.email, status: t.status, role: t.role })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: 'TEACHER' }).select('-password');
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found', data: null });
    res.json({
      success: true,
      message: 'Teacher retrieved',
      data: { teacher: { id: teacher._id, name: teacher.name, email: teacher.email, status: teacher.status, role: teacher.role } }
    });
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required', data: null });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters', data: null });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists', data: null });
    }

    const teacher = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: 'TEACHER',
      status: 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: { teacher: { id: teacher._id, name: teacher.name, email: teacher.email, status: teacher.status, role: teacher.role } }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already exists', data: null });
      }
      updates.email = email.toLowerCase();
    }

    const teacher = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'TEACHER' },
      updates,
      { new: true }
    ).select('-password');

    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found', data: null });

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: { teacher: { id: teacher._id, name: teacher.name, email: teacher.email, status: teacher.status, role: teacher.role } }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeacherStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status', data: null });
    }

    const teacher = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'TEACHER' },
      { status },
      { new: true }
    ).select('-password');

    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found', data: null });

    res.json({
      success: true,
      message: 'Teacher status updated',
      data: { teacher: { id: teacher._id, name: teacher.name, email: teacher.email, status: teacher.status, role: teacher.role } }
    });
  } catch (error) {
    next(error);
  }
};
