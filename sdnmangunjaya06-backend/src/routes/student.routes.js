import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadProfilePhoto } from '../middlewares/upload.middleware.js';
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent
} from '../controllers/student.controller.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'guru'), getStudents);
router.post('/', authenticate, authorize('admin'), uploadProfilePhoto('photo'), createStudent);
router.put('/:id', authenticate, authorize('admin'), uploadProfilePhoto('photo'), updateStudent);
router.delete('/:id', authenticate, authorize('admin'), deleteStudent);

export default router;
