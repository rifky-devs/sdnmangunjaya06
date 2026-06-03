import bcrypt from 'bcryptjs';
import { pool, testConnection } from '../config/database.js';
import {
  calculateFinalScore,
  determineGraduationStatus
} from '../utils/gradeCalculator.js';

const seed = async () => {
  await testConnection();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query('DELETE FROM grades');
    await connection.query('DELETE FROM teachers');
    await connection.query('DELETE FROM students');
    await connection.query('DELETE FROM subjects');
    await connection.query('DELETE FROM classes');
    await connection.query('DELETE FROM users');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const guruPassword = await bcrypt.hash('guru123', 10);
    const siswaPassword = await bcrypt.hash('siswa123', 10);

    const [adminUser] = await connection.query(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin', adminPassword, 'Administrator Sekolah', 'admin']
    );

    await connection.query('INSERT INTO classes (name) VALUES (?), (?), (?)', [
      '5A',
      '5B',
      '6A'
    ]);

    await connection.query('INSERT INTO subjects (name) VALUES (?), (?), (?)', [
      'Matematika',
      'Bahasa Indonesia',
      'Ilmu Pengetahuan Alam'
    ]);

    const [[mathSubject]] = await connection.query('SELECT id FROM subjects WHERE name = ?', ['Matematika']);
    const [[class6A]] = await connection.query('SELECT id FROM classes WHERE name = ?', ['6A']);

    const [teacherUser] = await connection.query(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      ['guru', guruPassword, 'Ibu Rina Wulandari', 'guru']
    );

    const [teacher] = await connection.query(
      'INSERT INTO teachers (user_id, teacher_code, name, subject_id) VALUES (?, ?, ?, ?)',
      [teacherUser.insertId, 'G001', 'Ibu Rina Wulandari', mathSubject.id]
    );

    const [studentUser] = await connection.query(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      ['siswa', siswaPassword, 'Ahmad Fikri Pratama', 'siswa']
    );

    const [student] = await connection.query(
      'INSERT INTO students (user_id, nis, name, class_id) VALUES (?, ?, ?, ?)',
      [studentUser.insertId, '2026001', 'Ahmad Fikri Pratama', class6A.id]
    );

    const scores = {
      assignment_score: 85,
      midterm_score: 82,
      final_exam_score: 88
    };
    const finalScore = calculateFinalScore(
      scores.assignment_score,
      scores.midterm_score,
      scores.final_exam_score
    );

    await connection.query(
      `
      INSERT INTO grades (
        student_id,
        teacher_id,
        subject_id,
        assignment_score,
        midterm_score,
        final_exam_score,
        final_score,
        status,
        validation_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        student.insertId,
        teacher.insertId,
        mathSubject.id,
        scores.assignment_score,
        scores.midterm_score,
        scores.final_exam_score,
        finalScore,
        determineGraduationStatus(finalScore),
        'Valid'
      ]
    );

    await connection.commit();
    console.log('Seed data berhasil dibuat.');
    console.log('Akun demo: admin/admin123, guru/guru123, siswa/siswa123');
  } catch (error) {
    await connection.rollback();
    console.error('Seed gagal:', error.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
};

seed();
