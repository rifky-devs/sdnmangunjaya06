import fs from 'fs';
import path from 'path';
import { Teacher } from '../models/Teacher.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { pool } from '../config/database.js';

export const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.findAll();
  const result = teachers.map((t) => ({
    ...t,
    photo_url: t.photo ? `${req.protocol}://${req.get('host')}/uploads/profiles/${t.photo}` : null
  }));
  res.json(result);
});

export const createTeacher = asyncHandler(async (req, res) => {
  const { teacher_code, name, subject_id, username, password } = req.body;

  if (!teacher_code || !name || !subject_id || !username || !password) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw new HttpError(400, 'ID guru, nama, mapel, username, dan password wajib diisi.');
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
    const teacher = await Teacher.create({ teacher_code, name, subject_id, username, password, photo });
    res.status(201).json({
      ...teacher,
      photo_url: teacher.photo ? `${req.protocol}://${req.get('host')}/uploads/profiles/${teacher.photo}` : null
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

export const updateTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { teacher_code, name, subject_id, username, password, is_active } = req.body;

  if (!teacher_code || !name || !subject_id || !username) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw new HttpError(400, 'Kode guru, nama, mapel, dan username wajib diisi.');
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
    'SELECT t.user_id, u.photo FROM teachers t JOIN users u ON u.id = t.user_id WHERE t.id = ?',
    [id]
  );
  const existingTeacher = rows[0];
  if (!existingTeacher) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Gagal menghapus file temp:', err.message);
      }
    }
    throw new HttpError(404, 'Data guru tidak ditemukan.');
  }

  // Check unique username
  const [existingUserRows] = await pool.query(
    'SELECT id FROM users WHERE LOWER(TRIM(username)) = ? LIMIT 1',
    [username.trim().toLowerCase()]
  );
  if (existingUserRows.length > 0 && Number(existingUserRows[0].id) !== Number(existingTeacher.user_id)) {
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
    await Teacher.update(id, {
      teacher_code,
      name,
      subject_id,
      username,
      password: password || null,
      photo: photo || null,
      is_active: is_active !== undefined ? Number(is_active) : 1
    });

    if (photo && existingTeacher.photo) {
      const oldFilePath = path.join(process.cwd(), 'uploads/profiles', existingTeacher.photo);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error('Gagal menghapus foto lama:', err.message);
        }
      }
    }

    res.json({ message: 'Data guru berhasil diperbarui.' });
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

export const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.delete(req.params.id);

  if (!teacher) {
    throw new HttpError(404, 'Data guru tidak ditemukan.');
  }

  if (teacher.photo) {
    const filePath = path.join(process.cwd(), 'uploads/profiles', teacher.photo);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Gagal menghapus foto guru:', err.message);
      }
    }
  }

  res.json({ message: 'Data guru berhasil dihapus.' });
});
