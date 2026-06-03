import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadProfilePhoto } from '../middlewares/upload.middleware.js';
import {
  getProfile,
  updateProfile,
  updateProfilePhoto
} from '../controllers/profile.controller.js';

const router = Router();

router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.patch('/me/photo', authenticate, uploadProfilePhoto('photo'), updateProfilePhoto);

export default router;
