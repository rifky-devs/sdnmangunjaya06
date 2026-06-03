import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const login = asyncHandler(async (req, res) => {
  const username = String(req.body.username || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "").trim();

  console.log("LOGIN BODY:", req.body);
  console.log("USERNAME RECEIVED:", username);

  if (!username || !password) {
    throw new HttpError(400, "Username dan password wajib diisi.");
  }

  const [rows] = await pool.query(
    `
    SELECT id, username, password, name, role, is_active, photo
    FROM users
    WHERE LOWER(TRIM(username)) = ?
    LIMIT 1
    `,
    [username],
  );

  console.log("USER FOUND:", rows.length);

  const user = rows[0];

  if (!user) {
    throw new HttpError(401, `Akun ${username} tidak ditemukan.`);
  }

  if (Number(user.is_active) !== 1) {
    throw new HttpError(401, `Akun ${username} tidak aktif.`);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new HttpError(401, "Username atau password salah.");
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      photo: user.photo,
      photo_url: user.photo ? `${req.protocol}://${req.get('host')}/uploads/profiles/${user.photo}` : null
    },
  });
});
