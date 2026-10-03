import Student from '../models/Student.js';
import TeachingAssignment from '../models/TeachingAssignment.js';
import { findStudentForUser } from '../utils/studentAccess.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const safeFetch = async (path, options = {}, timeoutMs = 10000) => {
  let response;
  try {
    response = await fetch(`${ML_SERVICE_URL}${path}`, {
      ...options,
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch {
    throw Object.assign(new Error('ML service unavailable'), { statusCode: 503 });
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(data.detail)
      ? data.detail.map((issue) => issue.msg).filter(Boolean).join('; ')
      : data.detail || data.message || 'ML service request failed';
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  return data;
};

export const getMLHealth = async (_req, res) => {
  try {
    const payload = await safeFetch('/health');
    return res.json({ success: true, message: 'ML service health check passed', data: payload });
  } catch {
    return res.status(503).json({
      success: false,
      message: 'ML service unavailable',
      data: { service: 'offline', status: 'degraded' },
    });
  }
};

export const predictRisk = async (req, res, next) => {
  try {
    const record = req.body || {};
    const definedFields = [
      'attendancePct',
      'studyHoursPerDay',
      'previousCgpa',
      'sleepHoursPerDay',
      'classParticipationPct',
      'backlogs',
      'internalMarks',
      'assignmentAvg',
      'midtermMarks',
      'labMarks',
    ];

    let source = record;
    if (req.user.role === 'STUDENT') {
      const student = await findStudentForUser(req.user);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found', data: null });
      }
      source = student;
    } else if (req.user.role === 'TEACHER') {
      if (!record.studentId) {
        return res.status(400).json({ success: false, message: 'studentId is required for teacher predictions', data: null });
      }
      const student = await Student.findOne({
        $or: [
          { studentId: record.studentId },
          ...(String(record.studentId).match(/^[0-9a-f]{24}$/i) ? [{ _id: record.studentId }] : []),
        ],
      });
      if (!student) return res.status(404).json({ success: false, message: 'Student not found', data: null });
      const assignment = await TeachingAssignment.exists({
        teacherId: req.user._id,
        classId: student.classId,
        status: 'ACTIVE',
      });
      if (!assignment) return res.status(403).json({ success: false, message: 'You are not assigned to this student', data: null });
      source = student;
    }

    const payload = {};
    definedFields.forEach((field) => {
      if (source[field] !== undefined && source[field] !== null && source[field] !== '') {
        payload[field] = source[field];
      }
    });

    if (Object.keys(payload).length !== definedFields.length) {
      return res.status(400).json({ success: false, message: 'All prediction fields are required', data: null });
    }
    if (definedFields.some((field) => typeof payload[field] !== 'number' || !Number.isFinite(payload[field]))) {
      return res.status(400).json({ success: false, message: 'Prediction features must be finite numbers', data: null });
    }

    const data = await safeFetch('/predict/risk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return res.json({ success: true, message: 'Risk prediction ready', data });
  } catch (error) {
    return next(error);
  }
};

export const trainModel = async (req, res) => {
  try {
    const payload = await safeFetch('/train', {
      method: 'POST',
      headers: { Authorization: `Bearer ${req.authToken}` },
      body: JSON.stringify({ force: Boolean(req.body?.force) }),
    }, 180000);
    return res.json({ success: true, message: 'Model training completed', data: payload });
  } catch (error) {
    const status = [400, 422].includes(error.statusCode) ? 400 : 503;
    return res.status(status).json({
      success: false,
      message: status === 400 ? 'Training data was rejected' : 'Training service unavailable',
      data: status === 400 ? { error: error.message } : null,
    });
  }
};

export const exportTrainingData = async (req, res, next) => {
  try {
    const students = await Student.find({}).lean();
    const records = students.map((student) => ({
      studentId: student.studentId,
      age: student.age,
      attendancePct: student.attendancePct,
      studyHoursPerDay: student.studyHoursPerDay,
      previousCgpa: student.previousCgpa,
      sleepHoursPerDay: student.sleepHoursPerDay,
      classParticipationPct: student.classParticipationPct,
      backlogs: student.backlogs,
      internalMarks: student.internalMarks,
      assignmentAvg: student.assignmentAvg,
      midtermMarks: student.midtermMarks,
      labMarks: student.labMarks,
      riskLevel: student.riskLevel,
      performanceCategory: student.performanceCategory,
    }));

    return res.json({
      success: true,
      message: 'Training dataset exported',
      data: { rows: records.length, students: records },
    });
  } catch (error) {
    next(error);
  }
};
