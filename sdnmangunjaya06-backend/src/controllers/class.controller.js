import { pool } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const getClasses = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, name FROM classes ORDER BY name ASC');
  res.json(rows);
});

export const createClass = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new HttpError(400, 'Nama kelas wajib diisi.');
  }

  const [result] = await pool.query('INSERT INTO classes (name) VALUES (?)', [name]);
  res.status(201).json({ id: result.insertId, name });
});

export const deleteClass = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM classes WHERE id = ?', [req.params.id]);
  res.json({ message: 'Data kelas berhasil dihapus.' });
});
