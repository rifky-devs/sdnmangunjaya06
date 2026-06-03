import { pool } from '../config/database.js';

const reportQuery = `
  SELECT
    g.id,
    st.nis,
    st.name AS student_name,
    c.name AS class_name,
    sb.name AS subject_name,
    tc.name AS teacher_name,
    g.assignment_score,
    g.midterm_score,
    g.final_exam_score,
    g.final_score,
    g.status,
    g.validation_status,
    g.created_at,
    g.updated_at
  FROM grades g
  JOIN students st ON st.id = g.student_id
  JOIN classes c ON c.id = st.class_id
  JOIN subjects sb ON sb.id = g.subject_id
  JOIN teachers tc ON tc.id = g.teacher_id
`;

export class Grade {
  static async findAll() {
    const [rows] = await pool.query(`${reportQuery} ORDER BY c.name ASC, st.name ASC, sb.name ASC`);
    return rows;
  }

  static async findLatest(limit = 5) {
    const [rows] = await pool.query(`${reportQuery} ORDER BY g.updated_at DESC LIMIT ?`, [limit]);
    return rows;
  }

  static async findByTeacher(teacherId) {
    const [rows] = await pool.query(
      `${reportQuery} WHERE g.teacher_id = ? ORDER BY g.updated_at DESC`,
      [teacherId]
    );

    return rows;
  }

  static async findByStudentUserId(userId) {
    const [rows] = await pool.query(
      `${reportQuery} WHERE st.user_id = ? ORDER BY sb.name ASC`,
      [userId]
    );

    return rows;
  }

  static async createOrUpdate({
    student_id,
    teacher_id,
    subject_id,
    assignment_score,
    midterm_score,
    final_exam_score,
    final_score,
    status,
    validation_status
  }) {
    const [result] = await pool.query(
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
      ON DUPLICATE KEY UPDATE
        teacher_id = VALUES(teacher_id),
        assignment_score = VALUES(assignment_score),
        midterm_score = VALUES(midterm_score),
        final_exam_score = VALUES(final_exam_score),
        final_score = VALUES(final_score),
        status = VALUES(status),
        validation_status = VALUES(validation_status)
      `,
      [
        student_id,
        teacher_id,
        subject_id,
        assignment_score,
        midterm_score,
        final_exam_score,
        final_score,
        status,
        validation_status
      ]
    );

    return result;
  }
}
