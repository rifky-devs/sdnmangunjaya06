import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Token tidak ditemukan.'));
  }

  const token = header.replace('Bearer ', '');

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch (error) {
    next(new HttpError(401, 'Token tidak valid atau sudah kedaluwarsa.'));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new HttpError(403, 'Anda tidak memiliki hak akses ke fitur ini.'));
    }

    next();
  };
};
