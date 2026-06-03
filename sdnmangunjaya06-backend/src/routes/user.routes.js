import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadProfilePhoto } from '../middlewares/upload.middleware.js';
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  updateUserPassword,
  updateUserPhoto,
  updateUserStatus
} from '../controllers/user.controller.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), getUsers);
router.post('/', authenticate, authorize('admin'), uploadProfilePhoto('photo'), createUser);
router.put('/:id', authenticate, authorize('admin'), uploadProfilePhoto('photo'), updateUser);
router.patch('/:id/photo', authenticate, uploadProfilePhoto('photo'), updateUserPhoto);
router.patch('/:id/password', authenticate, updateUserPassword);
router.patch('/:id/status', authenticate, authorize('admin'), updateUserStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;
