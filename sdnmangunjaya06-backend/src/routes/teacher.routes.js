import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadProfilePhoto } from '../middlewares/upload.middleware.js';
import {
  createTeacher,
  deleteTeacher,
  getTeachers,
  updateTeacher
} from '../controllers/teacher.controller.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), getTeachers);
router.post('/', authenticate, authorize('admin'), uploadProfilePhoto('photo'), createTeacher);
router.put('/:id', authenticate, authorize('admin'), uploadProfilePhoto('photo'), updateTeacher);
router.delete('/:id', authenticate, authorize('admin'), deleteTeacher);

export default router;
