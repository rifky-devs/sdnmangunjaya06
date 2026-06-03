import { pool } from '../config/database.js';
import { Grade } from '../models/Grade.js';
import { Teacher } from '../models/Teacher.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const countRows = async (table) => {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM ${table}`);
  return rows[0].total;
};

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    students, teachers, subjects, grades, latestGrades,
    classes, activeUsers, classDistribution, statusDistribution,
    latestUsers, latestStudents, latestTeachers
  ] = await Promise.all([
    countRows('students'),
    countRows('teachers'),
    countRows('subjects'),
    countRows('grades'),
    Grade.findLatest(5),
    countRows('classes'),
    pool.query('SELECT COUNT(*) AS total FROM users WHERE is_active = 1').then(([rows]) => rows[0].total),
    pool.query('SELECT c.name AS className, COUNT(s.id) AS studentCount FROM classes c LEFT JOIN students s ON s.class_id = c.id GROUP BY c.id, c.name').then(([rows]) => rows),
    pool.query('SELECT status, COUNT(*) AS count FROM grades GROUP BY status').then(([rows]) => rows),
    pool.query('SELECT id, name, username, role, is_active, created_at FROM users ORDER BY id DESC LIMIT 5').then(([rows]) => rows),
    pool.query('SELECT s.id, s.name, s.nis, c.name AS class_name FROM students s JOIN classes c ON c.id = s.class_id ORDER BY s.id DESC LIMIT 5').then(([rows]) => rows),
    pool.query('SELECT t.id, t.name, t.teacher_code, sub.name AS subject_name FROM teachers t JOIN subjects sub ON sub.id = t.subject_id ORDER BY t.id DESC LIMIT 5').then(([rows]) => rows)
  ]);

  res.json({
    stats: {
      students,
      teachers,
      subjects,
      grades,
      classes,
      activeUsers
    },
    latestGrades,
    classDistribution,
    statusDistribution,
    latestUsers,
    latestStudents,
    latestTeachers
  });
});

export const getGuruDashboard = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByUserId(req.user.id);

  if (!teacher) {
    throw new HttpError(404, 'Profil guru tidak ditemukan.');
  }

  const [studentRows] = await pool.query('SELECT COUNT(*) AS total FROM students');
  const grades = await Grade.findByTeacher(teacher.id);
  const validGrades = grades.filter((g) => g.validation_status === 'Valid').length;
  const draftGrades = grades.filter((g) => g.validation_status === 'Draft').length;

  res.json({
    stats: {
      students: studentRows[0].total,
      subject: teacher.subject_name,
      grades: grades.length,
      valid: validGrades,
      draft: draftGrades
    },
    recent: grades.slice(0, 5)
  });
});

export const getPublicStats = asyncHandler(async (req, res) => {
  const [studentRows] = await pool.query('SELECT COUNT(*) AS total FROM students');
  const [totalGradesRows] = await pool.query('SELECT COUNT(*) AS total FROM grades');
  const [validatedGradesRows] = await pool.query("SELECT COUNT(*) AS total FROM grades WHERE validation_status = 'Valid'");
  const [avgGradeRows] = await pool.query('SELECT AVG(final_score) AS average FROM grades');

  const students = studentRows[0]?.total || 0;
  const totalGrades = totalGradesRows[0]?.total || 0;
  const validatedGrades = validatedGradesRows[0]?.total || 0;
  
  const validationRate = totalGrades > 0 ? Math.round((validatedGrades / totalGrades) * 100) : 0;
  
  const rawAverage = avgGradeRows[0]?.average;
  const averageGrade = rawAverage !== null && rawAverage !== undefined ? Number(rawAverage).toFixed(1) : "0.0";

  res.json({
    students,
    validationRate: validationRate > 0 ? `${validationRate}%` : "0%",
    averageGrade: averageGrade !== "0.0" ? averageGrade : "0.0"
  });
});
