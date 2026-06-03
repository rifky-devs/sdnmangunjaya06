import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { pool } from "../config/database.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

const formatPhotoUrl = (req, photo) => {
  return photo ? `${req.protocol}://${req.get("host")}/uploads/profiles/${photo}` : null;
};

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll();
  const result = users.map((user) => ({
    ...user,
    photo_url: formatPhotoUrl(req, user.photo),
  }));
  res.json(result);
});

export const createUser = asyncHandler(async (req, res) => {
  const { username, password, name, role, is_active } = req.body;

  const unlinkFile = () => {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  if (!username) {
    unlinkFile();
    throw new HttpError(400, "Username wajib diisi.");
  }

  if (!password) {
    unlinkFile();
    throw new HttpError(400, "Password wajib diisi.");
  }

  if (!name) {
    unlinkFile();
    throw new HttpError(400, "Nama wajib diisi.");
  }

  if (!role || !["admin", "guru", "siswa"].includes(role)) {
    unlinkFile();
    throw new HttpError(400, "Role wajib dipilih.");
  }

  const usernameRegex = /^[A-Za-z0-9]+$/;
  if (!usernameRegex.test(username)) {
    unlinkFile();
    throw new HttpError(400, "Username hanya boleh berisi huruf kecil, huruf besar, dan angka.");
  }

  // Check unique username
  const existingUsername = await User.findByUsername(username);
  if (existingUsername) {
    unlinkFile();
    throw new HttpError(400, "Username sudah digunakan.");
  }

  const activeStatus = is_active !== undefined ? Number(is_active) : 1;
  const photo = req.file ? req.file.filename : null;

  try {
    const user = await User.create({ username, password, name, role, is_active: activeStatus });
    if (photo) {
      await User.updatePhoto(user.id, photo);
      user.photo = photo;
    }

    res.status(201).json({
      ...user,
      photo_url: formatPhotoUrl(req, user.photo),
    });
  } catch (error) {
    unlinkFile();
    throw error;
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, username, role, is_active } = req.body;

  const unlinkFile = () => {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  if (!username) {
    unlinkFile();
    throw new HttpError(400, "Username wajib diisi.");
  }

  if (!name) {
    unlinkFile();
    throw new HttpError(400, "Nama wajib diisi.");
  }

  if (!role || !["admin", "guru", "siswa"].includes(role)) {
    unlinkFile();
    throw new HttpError(400, "Role wajib dipilih.");
  }

  const usernameRegex = /^[A-Za-z0-9]+$/;
  if (!usernameRegex.test(username)) {
    unlinkFile();
    throw new HttpError(400, "Username hanya boleh berisi huruf kecil, huruf besar, dan angka.");
  }

  // Check unique username
  const existingUsername = await User.findByUsername(username);
  if (existingUsername && Number(existingUsername.id) !== Number(id)) {
    unlinkFile();
    throw new HttpError(400, "Username sudah digunakan.");
  }

  const activeStatus = is_active !== undefined ? Number(is_active) : 1;
  const photo = req.file ? req.file.filename : null;

  try {
    const existingUser = await User.findById(id);
    if (!existingUser) {
      unlinkFile();
      throw new HttpError(404, "User tidak ditemukan.");
    }

    const updated = await User.update(id, { name, username, role, is_active: activeStatus });

    if (photo) {
      // Remove old photo if exists
      if (existingUser.photo) {
        const oldPath = path.join(process.cwd(), "uploads/profiles", existingUser.photo);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.error("Gagal menghapus foto lama:", err.message);
          }
        }
      }
      await User.updatePhoto(id, photo);
      updated.photo = photo;
    } else {
      updated.photo = existingUser.photo;
    }

    res.json({
      ...updated,
      photo_url: formatPhotoUrl(req, updated.photo),
    });
  } catch (error) {
    unlinkFile();
    throw error;
  }
});

export const updateUserPhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    throw new HttpError(400, "File foto profil wajib disertakan.");
  }

  // Ensure requesting user is admin or updating their own profile
  if (req.user.role !== "admin" && Number(req.user.id) !== Number(id)) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error(err.message);
    }
    throw new HttpError(403, "Anda tidak diizinkan mengubah foto user lain.");
  }

  const existingUser = await User.findById(id);
  if (!existingUser) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error(err.message);
    }
    throw new HttpError(404, "User tidak ditemukan.");
  }

  const photo = req.file.filename;

  if (existingUser.photo) {
    const oldPath = path.join(process.cwd(), "uploads/profiles", existingUser.photo);
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error("Gagal menghapus foto lama:", err.message);
      }
    }
  }

  await User.updatePhoto(id, photo);

  res.json({
    message: "Foto profil berhasil diperbarui.",
    photo,
    photo_url: formatPhotoUrl(req, photo),
  });
});

export const updateUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new HttpError(400, "Password baru wajib diisi.");
  }

  // Ensure requesting user is admin or updating their own password
  if (req.user.role !== "admin" && Number(req.user.id) !== Number(id)) {
    throw new HttpError(403, "Anda tidak diizinkan mengubah password user lain.");
  }

  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new HttpError(404, "User tidak ditemukan.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updatePassword(id, hashedPassword);

  res.json({ message: "Password berhasil diperbarui." });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (is_active === undefined) {
    throw new HttpError(400, "Status aktif wajib disertakan.");
  }

  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new HttpError(404, "User tidak ditemukan.");
  }

  const activeStatus = Number(is_active);
  await User.updateStatus(id, activeStatus);

  res.json({ message: "Status user berhasil diperbarui.", is_active: activeStatus });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Prevent deleting the last remaining admin account
    const targetUser = await User.findById(id);
    if (!targetUser) {
      throw new HttpError(404, "User tidak ditemukan.");
    }

    if (targetUser.role === "admin") {
      const [rows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = ?", ["admin"]);
      const adminCount = rows[0]?.count || 0;
      if (adminCount <= 1) {
        throw new HttpError(400, "Tidak dapat menghapus admin utama. Setidaknya harus ada satu akun administrator.");
      }
    }

    const deletedUser = await User.delete(id);

    if (!deletedUser) {
      throw new HttpError(404, "User tidak ditemukan.");
    }

    if (deletedUser.photo) {
      const filePath = path.join(process.cwd(), "uploads/profiles", deletedUser.photo);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Gagal menghapus file foto profil:", err.message);
        }
      }
    }

    res.json({ message: "Akun user berhasil dihapus secara permanen." });
  } catch (error) {
    throw new HttpError(400, error.message);
  }
});
