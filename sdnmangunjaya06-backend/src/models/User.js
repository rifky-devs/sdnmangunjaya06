import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

export class User {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        username, 
        name, 
        role, 
        is_active, 
        photo,
        created_at,
        updated_at
      FROM users
      ORDER BY role ASC, name ASC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT 
        id, 
        username, 
        name, 
        role, 
        is_active, 
        photo,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.query(
      `
      SELECT 
        id, 
        username, 
        name, 
        role, 
        is_active, 
        photo,
        created_at,
        updated_at
      FROM users
      WHERE LOWER(TRIM(username)) = ?
      LIMIT 1
      `,
      [username.trim().toLowerCase()]
    );
    return rows[0];
  }

  static async create({ username, password, name, role, is_active = 1 }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const hashedPassword = await bcrypt.hash(password, 10);
      const [userResult] = await connection.query(
        'INSERT INTO users (username, password, name, role, is_active) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, name, role, is_active]
      );

      const userId = userResult.insertId;

      // If siswa or guru, create skeleton record to keep students/teachers tables populated
      if (role === 'siswa') {
        // Find a default class to assign
        const [classes] = await connection.query('SELECT id FROM classes LIMIT 1');
        const classId = classes[0]?.id || 1;
        
        await connection.query(
          'INSERT INTO students (user_id, nis, name, class_id) VALUES (?, ?, ?, ?)',
          [userId, `NIS-${username}-${Date.now().toString().slice(-4)}`, name, classId]
        );
      } else if (role === 'guru') {
        // Find a default subject to assign
        const [subjects] = await connection.query('SELECT id FROM subjects LIMIT 1');
        const subjectId = subjects[0]?.id || 1;

        await connection.query(
          'INSERT INTO teachers (user_id, teacher_code, name, subject_id) VALUES (?, ?, ?, ?)',
          [userId, `NIP-${username}-${Date.now().toString().slice(-4)}`, name, subjectId]
        );
      }

      await connection.commit();

      return {
        id: userId,
        username,
        name,
        role,
        is_active
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, { name, username, role, is_active }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check current role before update
      const [currentRows] = await connection.query('SELECT role, name FROM users WHERE id = ?', [id]);
      const currentUser = currentRows[0];

      if (!currentUser) {
        throw new Error('User tidak ditemukan.');
      }

      await connection.query(
        'UPDATE users SET name = ?, username = ?, role = ?, is_active = ? WHERE id = ?',
        [name, username, role, is_active, id]
      );

      // If name changes, update the name inside students or teachers tables as well
      if (role === 'siswa') {
        const [studentRows] = await connection.query('SELECT id FROM students WHERE user_id = ?', [id]);
        if (studentRows.length > 0) {
          await connection.query('UPDATE students SET name = ? WHERE user_id = ?', [name, id]);
        } else {
          // If skeleton was missing, create it
          const [classes] = await connection.query('SELECT id FROM classes LIMIT 1');
          const classId = classes[0]?.id || 1;
          await connection.query(
            'INSERT INTO students (user_id, nis, name, class_id) VALUES (?, ?, ?, ?)',
            [id, `NIS-${username}`, name, classId]
          );
        }
      } else if (role === 'guru') {
        const [teacherRows] = await connection.query('SELECT id FROM teachers WHERE user_id = ?', [id]);
        if (teacherRows.length > 0) {
          await connection.query('UPDATE teachers SET name = ? WHERE user_id = ?', [name, id]);
        } else {
          // If skeleton was missing, create it
          const [subjects] = await connection.query('SELECT id FROM subjects LIMIT 1');
          const subjectId = subjects[0]?.id || 1;
          await connection.query(
            'INSERT INTO teachers (user_id, teacher_code, name, subject_id) VALUES (?, ?, ?, ?)',
            [id, `NIP-${username}`, name, subjectId]
          );
        }
      }

      await connection.commit();

      return {
        id,
        name,
        username,
        role,
        is_active
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updatePassword(id, hashedPassword) {
    const [result] = await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    return result;
  }

  static async updatePhoto(id, photo) {
    const [result] = await pool.query('UPDATE users SET photo = ? WHERE id = ?', [photo, id]);
    return result;
  }

  static async updateStatus(id, is_active) {
    const [result] = await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);
    return result;
  }

  static async delete(id) {
    // Check if the user is a teacher and has grades
    const [teachers] = await pool.query('SELECT id FROM teachers WHERE user_id = ?', [id]);
    if (teachers.length > 0) {
      const teacherId = teachers[0].id;
      const [grades] = await pool.query('SELECT id FROM grades WHERE teacher_id = ? LIMIT 1', [teacherId]);
      if (grades.length > 0) {
        throw new Error('Akun guru tidak dapat dihapus karena sudah memiliki data nilai. Silakan nonaktifkan akun sebagai gantinya.');
      }
    }

    const [rows] = await pool.query('SELECT photo FROM users WHERE id = ?', [id]);
    const user = rows[0];

    if (!user) {
      return null;
    }

    // Delete user (cascade will handle students and teachers tables)
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return user; // Returns user photo info to delete physical file
  }
}
