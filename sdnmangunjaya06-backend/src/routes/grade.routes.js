import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import {
  createOrUpdateGrade,
  getAllGrades,
  getMyGrades,
  getMySubjectGrades
} from '../controllers/grade.controller.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), getAllGrades);
router.get('/my-subject', authenticate, authorize('guru'), getMySubjectGrades);
router.get('/me', authenticate, authorize('siswa'), getMyGrades);
router.post('/', authenticate, authorize('guru'), createOrUpdateGrade);

export default router;
