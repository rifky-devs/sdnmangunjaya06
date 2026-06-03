import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { HttpError } from '../utils/httpError.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/profiles';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const username = req.body.username || (req.user ? req.user.username : 'user') || 'profile';
    cb(null, `user-${username.trim().toLowerCase()}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new HttpError(400, 'Format foto harus JPG, JPEG, PNG, atau WEBP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 // 500 KB
  }
});

export const uploadProfilePhoto = (fieldName) => {
  const uploadSingle = upload.single(fieldName);

  return (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new HttpError(400, 'Ukuran foto maksimal 500 KB.'));
          }
          return next(new HttpError(400, err.message));
        }
        return next(err);
      }
      next();
    });
  };
};
