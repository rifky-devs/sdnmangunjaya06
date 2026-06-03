import { pool } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const getSubjects = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, name FROM subjects ORDER BY name ASC');
  res.json(rows);
});

export const createSubject = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new HttpError(400, 'Nama mata pelajaran wajib diisi.');
  }

  const [result] = await pool.query('INSERT INTO subjects (name) VALUES (?)', [name]);
  res.status(201).json({ id: result.insertId, name });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
  res.json({ message: 'Mata pelajaran berhasil dihapus.' });
});
