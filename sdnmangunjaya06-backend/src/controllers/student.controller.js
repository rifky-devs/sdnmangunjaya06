import fs from 'fs';
import path from 'path';
import { Student } from '../models/Student.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { pool } from '../config/database.js';

export const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.findAll();
  const result = students.map((s) => ({
    ...s,
    photo_url: s.photo ? `${req.protocol}://${req.get('host')}/uploads/profiles/${s.photo}` : null
  }));
  res.json(result);
});

export const createStudent = asyncHandler(async (req, res) => {
  const { nis, name, class_id, username, password } = req.body;

  if (!nis || !name || !class_id || !username || !password) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw new HttpError(400, 'NIS, nama, kelas, username, dan password wajib diisi.');
  }

  const usernameRegex = /^[A-Za-z0-9]+$/;
  if (!usernameRegex.test(username)) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw new HttpError(400, 'Username hanya boleh berisi huruf kecil, huruf besar, dan angka.');
  }

  // Check unique username
  const [existingUserRows] = await pool.query(
    'SELECT id FROM users WHERE LOWER(TRIM(username)) = ? LIMIT 1',
    [username.trim().toLowerCase()]
  );
  if (existingUserRows.length > 0) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw new HttpError(400, 'Username sudah digunakan.');
  }

  const photo = req.file ? req.file.filename : null;

  try {
    const student = await Student.create({ nis, name, class_id, username, password, photo });
    res.status(201).json({
      ...student,
      photo_url: student.photo ? `${req.protocol}://${req.get('host')}/uploads/profiles/${student.photo}` : null
    });
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw error;
  }
});

export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nis, name, class_id, username, password, is_active } = req.body;

  if (!nis || !name || !class_id || !username) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw new HttpError(400, 'NIS, nama, kelas, dan username wajib diisi.');
  }

  const usernameRegex = /^[A-Za-z0-9]+$/;
  if (!usernameRegex.test(username)) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw new HttpError(400, 'Username hanya boleh berisi huruf kecil, huruf besar, dan angka.');
  }

  const photo = req.file ? req.file.filename : null;

  const [rows] = await pool.query(
    'SELECT s.user_id, u.photo FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = ?',
    [id]
  );
  const existingStudent = rows[0];
  if (!existingStudent) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw new HttpError(404, 'Data siswa tidak ditemukan.');
  }

  // Check unique username
  const [existingUserRows] = await pool.query(
    'SELECT id FROM users WHERE LOWER(TRIM(username)) = ? LIMIT 1',
    [username.trim().toLowerCase()]
  );
  if (existingUserRows.length > 0 && Number(existingUserRows[0].id) !== Number(existingStudent.user_id)) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw new HttpError(400, 'Username sudah digunakan.');
  }

  try {
    await Student.update(id, {
      nis,
      name,
      class_id,
      username,
      password: password || null,
      photo: photo || null,
      is_active: is_active !== undefined ? Number(is_active) : 1
    });

    if (photo && existingStudent.photo) {
      const oldFilePath = path.join(process.cwd(), 'uploads/profiles', existingStudent.photo);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error('Gagal menghapus foto lama:', err.message);
        }
      }
    }

    res.json({ message: 'Data siswa berhasil diperbarui.' });
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw error;
  }
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.delete(req.params.id);

  if (!student) {
    throw new HttpError(404, 'Data siswa tidak ditemukan.');
  }

  if (student.photo) {
    const filePath = path.join(process.cwd(), 'uploads/profiles', student.photo);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Gagal menghapus foto siswa:', err.message);
      }
    }
  }

  res.json({ message: 'Data siswa berhasil dihapus.' });
});
