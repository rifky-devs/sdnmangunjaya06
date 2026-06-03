import fs from 'fs';
import path from 'path';
import { pool } from '../config/database.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const formatPhotoUrl = (req, photo) => {
  return photo ? `${req.protocol}://${req.get('host')}/uploads/profiles/${photo}` : null;
};

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  let query = '';
  if (role === 'siswa') {
    query = `
      SELECT 
        u.id, u.username, u.name, u.role, u.is_active, u.photo,
        s.nis, c.name AS class_name
      FROM users u
      LEFT JOIN students s ON s.user_id = u.id
      LEFT JOIN classes c ON c.id = s.class_id
      WHERE u.id = ?
      LIMIT 1
    `;
  } else if (role === 'guru') {
    query = `
      SELECT 
        u.id, u.username, u.name, u.role, u.is_active, u.photo,
        t.teacher_code, sb.name AS subject_name
      FROM users u
      LEFT JOIN teachers t ON t.user_id = u.id
      LEFT JOIN subjects sb ON sb.id = t.subject_id
      WHERE u.id = ?
      LIMIT 1
    `;
  } else {
    query = `
      SELECT 
        u.id, u.username, u.name, u.role, u.is_active, u.photo
      FROM users u
      WHERE u.id = ?
      LIMIT 1
    `;
  }

  const [rows] = await pool.query(query, [userId]);
  const profile = rows[0];

  if (!profile) {
    throw new HttpError(404, 'Profil tidak ditemukan.');
  }

  res.json({
    ...profile,
    photo_url: formatPhotoUrl(req, profile.photo)
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, username } = req.body;

  if (!name || !username) {
    throw new HttpError(400, 'Nama dan username wajib diisi.');
  }

  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new HttpError(404, 'User tidak ditemukan.');
  }

  // Admin and normal users can only change their baseline name and username
  await User.update(userId, {
    name,
    username,
    role: existingUser.role,
    is_active: existingUser.is_active
  });

  const updatedUser = await User.findById(userId);

  res.json({
    ...updatedUser,
    photo_url: formatPhotoUrl(req, updatedUser.photo)
  });
});

export const updateProfilePhoto = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    throw new HttpError(400, 'File foto profil wajib disertakan.');
  }

  const existingUser = await User.findById(userId);
  if (!existingUser) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error(err.message);
    }
    throw new HttpError(404, 'User tidak ditemukan.');
  }

  const photo = req.file.filename;

  if (existingUser.photo) {
    const oldPath = path.join(process.cwd(), 'uploads/profiles', existingUser.photo);
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error('Gagal menghapus foto lama:', err.message);
      }
    }
  }

  await User.updatePhoto(userId, photo);

  res.json({
    message: 'Foto profil berhasil diperbarui.',
    photo,
    photo_url: formatPhotoUrl(req, photo)
  });
});
