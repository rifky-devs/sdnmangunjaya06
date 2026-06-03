import { pool } from '../config/database.js';
import { Grade } from '../models/Grade.js';
import { Teacher } from '../models/Teacher.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import {
  calculateFinalScore,
  determineGraduationStatus,
  validateGradePayload
} from '../utils/gradeCalculator.js';

export const getAllGrades = asyncHandler(async (req, res) => {
  const grades = await Grade.findAll();
  res.json(grades);
});

export const getMySubjectGrades = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByUserId(req.user.id);

  if (!teacher) {
    throw new HttpError(404, 'Profil guru tidak ditemukan.');
  }

  const grades = await Grade.findByTeacher(teacher.id);
  res.json(grades);
});

export const getMyGrades = asyncHandler(async (req, res) => {
  const [profileRows] = await pool.query(
    `
    SELECT
      s.id,
      s.nis,
      s.name,
      u.photo,
      c.name AS class_name
    FROM students s
    JOIN classes c ON c.id = s.class_id
    JOIN users u ON u.id = s.user_id
    WHERE s.user_id = ?
    LIMIT 1
    `,
    [req.user.id]
  );

  const profile = profileRows[0]
    ? {
        ...profileRows[0],
        photo_url: profileRows[0].photo
          ? `${req.protocol}://${req.get('host')}/uploads/profiles/${profileRows[0].photo}`
          : null
      }
    : null;

  if (!profile) {
    throw new HttpError(404, 'Profil siswa tidak ditemukan.');
  }

  const grades = await Grade.findByStudentUserId(req.user.id);
  const validGrades = grades.filter((item) => item.validation_status === 'Valid');
  const average =
    validGrades.length > 0
      ? (
          validGrades.reduce((total, item) => total + Number(item.final_score), 0) / validGrades.length
        ).toFixed(2)
      : null;

  res.json({
    profile,
    grades,
    summary: {
      total_subjects: grades.length,
      average_score: average || '-'
    }
  });
});

export const createOrUpdateGrade = asyncHandler(async (req, res) => {
  const {
    student_id,
    assignment_score,
    midterm_score,
    final_exam_score,
    validation_status = 'Draft'
  } = req.body;

  if (!student_id) {
    throw new HttpError(400, 'Siswa wajib dipilih.');
  }

  if (!validateGradePayload({ assignment_score, midterm_score, final_exam_score })) {
    throw new HttpError(400, 'Nilai tugas, UTS, dan UAS harus berada pada rentang 0 sampai 100.');
  }

  if (!['Draft', 'Valid'].includes(validation_status)) {
    throw new HttpError(400, 'Status validasi tidak valid.');
  }

  const teacher = await Teacher.findByUserId(req.user.id);

  if (!teacher) {
    throw new HttpError(404, 'Profil guru tidak ditemukan.');
  }

  const numericAssignment = Number(assignment_score);
  const numericMidterm = Number(midterm_score);
  const numericFinalExam = Number(final_exam_score);
  const finalScore = calculateFinalScore(numericAssignment, numericMidterm, numericFinalExam);
  const status = determineGraduationStatus(finalScore);

  await Grade.createOrUpdate({
    student_id,
    teacher_id: teacher.id,
    subject_id: teacher.subject_id,
    assignment_score: numericAssignment,
    midterm_score: numericMidterm,
    final_exam_score: numericFinalExam,
    final_score: finalScore,
    status,
    validation_status
  });

  res.status(201).json({
    message: 'Nilai berhasil disimpan.',
    final_score: finalScore,
    status
  });
});
