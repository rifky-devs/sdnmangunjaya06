import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

export class Teacher {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.teacher_code,
        t.name,
        t.subject_id,
        u.photo,
        u.is_active,
        t.user_id,
        s.name AS subject_name,
        u.username
      FROM teachers t
      JOIN subjects s ON s.id = t.subject_id
      JOIN users u ON u.id = t.user_id
      ORDER BY t.name ASC
    `);

    return rows;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `
      SELECT
        t.id,
        t.teacher_code,
        t.name,
        t.subject_id,
        u.photo,
        s.name AS subject_name
      FROM teachers t
      JOIN subjects s ON s.id = t.subject_id
      JOIN users u ON u.id = t.user_id
      WHERE t.user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    return rows[0];
  }

  static async create({ teacher_code, name, subject_id, username, password, photo }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const hashedPassword = await bcrypt.hash(password, 10);
      const [userResult] = await connection.query(
        'INSERT INTO users (username, password, name, role, photo) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, name, 'guru', photo || null]
      );

      const [teacherResult] = await connection.query(
        'INSERT INTO teachers (user_id, teacher_code, name, subject_id) VALUES (?, ?, ?, ?)',
        [userResult.insertId, teacher_code, name, subject_id]
      );

      await connection.commit();

      return {
        id: teacherResult.insertId,
        user_id: userResult.insertId,
        teacher_code,
        name,
        subject_id,
        photo: photo || null
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, { teacher_code, name, subject_id, username, password, photo, is_active }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [teacherRows] = await connection.query('SELECT user_id FROM teachers WHERE id = ?', [id]);
      const teacher = teacherRows[0];
      if (!teacher) throw new Error('Guru tidak ditemukan.');

      const userId = teacher.user_id;

      // Update teacher table
      await connection.query('UPDATE teachers SET teacher_code = ?, name = ?, subject_id = ? WHERE id = ?', [teacher_code, name, subject_id, id]);

      // Update users table
      await connection.query('UPDATE users SET name = ?, username = ?, is_active = ? WHERE id = ?', [name, username, is_active, userId]);

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
      }

      if (photo) {
        await connection.query('UPDATE users SET photo = ? WHERE id = ?', [photo, userId]);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const [rows] = await pool.query(
      `
      SELECT t.user_id, u.photo 
      FROM teachers t 
      JOIN users u ON u.id = t.user_id 
      WHERE t.id = ?
      `,
      [id]
    );
    const teacher = rows[0];

    if (!teacher) {
      return null;
    }

    await pool.query('DELETE FROM users WHERE id = ?', [teacher.user_id]);
    return teacher;
  }
}
