import { Router } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'node:stream';
import crypto from 'node:crypto';
import Student from '../models/Student.js';
import { authorize, protect } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const requiredHeaders = ['Student_ID','Age','Gender','Major','Attendance_Pct','Study_Hours_Per_Day','Previous_CGPA','Sleep_Hours_Per_Day','Class_Participation_Pct','Backlogs','Internal_Marks','Assignment_Avg','Midterm_Marks','Lab_Marks','Final_Score','Final_CGPA','Performance_Category','Risk_Level'];
const numeric = ['Age','Attendance_Pct','Study_Hours_Per_Day','Previous_CGPA','Sleep_Hours_Per_Day','Class_Participation_Pct','Backlogs','Internal_Marks','Assignment_Avg','Midterm_Marks','Lab_Marks','Final_Score','Final_CGPA'];
const previews = new Map();
const parse = (buffer) => new Promise((resolve, reject) => { const rows = []; let headers = []; Readable.from(buffer).pipe(csv()).on('headers', (h) => { headers = h; }).on('data', (r) => rows.push(r)).on('end', () => resolve({ rows, headers })).on('error', reject); });
const normalize = (r) => ({ studentId: r.Student_ID?.trim(), age: Number(r.Age), gender: r.Gender?.trim(), major: r.Major?.trim(), attendancePct: Number(r.Attendance_Pct), studyHoursPerDay: Number(r.Study_Hours_Per_Day), previousCgpa: Number(r.Previous_CGPA), sleepHoursPerDay: Number(r.Sleep_Hours_Per_Day), classParticipationPct: Number(r.Class_Participation_Pct), backlogs: Number(r.Backlogs), internalMarks: Number(r.Internal_Marks), assignmentAvg: Number(r.Assignment_Avg), midtermMarks: Number(r.Midterm_Marks), labMarks: Number(r.Lab_Marks), finalScore: Number(r.Final_Score), finalCgpa: Number(r.Final_CGPA), performanceCategory: r.Performance_Category?.trim(), riskLevel: r.Risk_Level?.trim() });
const validate = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required', data: null });
    const { rows, headers } = await parse(req.file.buffer); const errors = []; const seen = new Set(); const records = [];
    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
    if (missingHeaders.length) return res.status(400).json({ success: false, message: 'Missing required CSV headers', data: { missingHeaders } });
    rows.forEach((row, index) => {
      const rowErrors = []; const data = normalize(row);
      if (!data.studentId) rowErrors.push('Student_ID is required');
      else if (seen.has(data.studentId)) rowErrors.push('Duplicate Student_ID in file');
      else seen.add(data.studentId);
      for (const field of numeric) if (row[field] === undefined || row[field].trim() === '' || Number.isNaN(Number(row[field]))) rowErrors.push(`${field} must be numeric and is required`);
      for (const field of ['Gender','Major','Performance_Category','Risk_Level']) if (!row[field]?.trim()) rowErrors.push(`${field} is required`);
      if (rowErrors.length) errors.push({ row: index + 2, errors: rowErrors }); records.push(data);
    });
    const ids = records.map((r) => r.studentId).filter(Boolean); const existing = await Student.find({ studentId: { $in: ids } }).select('studentId').lean(); const existingIds = new Set(existing.map((r) => r.studentId));
    records.forEach((r, i) => { if (existingIds.has(r.studentId) && !errors.some((e) => e.row === i + 2 && e.errors.includes('Duplicate Student_ID in file'))) errors.push({ row: i + 2, errors: ['Student_ID already exists'] }); });
    const invalidRows = new Set(errors.map((e) => e.row - 2)); const validRows = records.filter((_, i) => !invalidRows.has(i));
    const token = crypto.randomUUID(); previews.set(token, { records, validRows, errors, createdAt: Date.now() });
    const duplicates = errors.filter((e) => e.errors.some((message) => message.includes('Duplicate') || message.includes('already exists'))).length;
    res.json({ success: true, message: 'CSV validated', data: { token, totalRows: rows.length, validRows: validRows.length, invalidRows: rows.length - validRows.length, duplicates, errors, sample: validRows.slice(0, 10) } });
  } catch (error) { next(error); }
};
const confirm = async (req, res, next) => {
  try {
    const preview = previews.get(req.body.token); if (!preview || Date.now() - preview.createdAt > 600000) return res.status(400).json({ success: false, message: 'Preview expired. Validate the file again.', data: null });
    const existing = new Set((await Student.find({ studentId: { $in: preview.validRows.map((r) => r.studentId) } }).select('studentId').lean()).map((r) => r.studentId));
    const documents = preview.validRows.filter((r) => !existing.has(r.studentId)); const result = documents.length ? await Student.insertMany(documents, { ordered: false }) : [];
    previews.delete(req.body.token); res.json({ success: true, message: 'Import completed', data: { totalRows: preview.records.length, imported: result.length, duplicates: preview.validRows.length - documents.length, invalid: preview.errors.length, errors: preview.errors } });
  } catch (error) { next(error); }
};
const router = Router(); router.use(protect, authorize('ADMIN')); router.post(['/validate', '/preview'], upload.single('file'), validate); router.post(['/', '/confirm'], confirm);
export default router;
