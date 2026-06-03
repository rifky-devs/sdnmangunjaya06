import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

export class Student {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT
        s.id,
        s.nis,
        s.name,
        s.class_id,
        u.photo,
        u.is_active,
        s.user_id,
        c.name AS class_name,
        u.username
      FROM students s
      JOIN classes c ON c.id = s.class_id
      JOIN users u ON u.id = s.user_id
      ORDER BY c.name ASC, s.name ASC
    `);

    return rows;
  }

  static async create({ nis, name, class_id, username, password, photo }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const hashedPassword = await bcrypt.hash(password, 10);
      const [userResult] = await connection.query(
        'INSERT INTO users (username, password, name, role, photo) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, name, 'siswa', photo || null]
      );

      const [studentResult] = await connection.query(
        'INSERT INTO students (user_id, nis, name, class_id) VALUES (?, ?, ?, ?)',
        [userResult.insertId, nis, name, class_id]
      );

      await connection.commit();

      return {
        id: studentResult.insertId,
        user_id: userResult.insertId,
        nis,
        name,
        class_id,
        photo: photo || null
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, { nis, name, class_id, username, password, photo, is_active }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [studentRows] = await connection.query('SELECT user_id FROM students WHERE id = ?', [id]);
      const student = studentRows[0];
      if (!student) throw new Error('Siswa tidak ditemukan.');

      const userId = student.user_id;

      // Update student table
      await connection.query('UPDATE students SET nis = ?, name = ?, class_id = ? WHERE id = ?', [nis, name, class_id, id]);

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
      SELECT s.user_id, u.photo 
      FROM students s 
      JOIN users u ON u.id = s.user_id 
      WHERE s.id = ?
      `,
      [id]
    );
    const student = rows[0];

    if (!student) {
      return null;
    }

    await pool.query('DELETE FROM users WHERE id = ?', [student.user_id]);
    return student;
  }
}
