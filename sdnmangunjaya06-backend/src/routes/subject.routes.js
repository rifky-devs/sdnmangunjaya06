import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import {
  createSubject,
  deleteSubject,
  getSubjects
} from '../controllers/subject.controller.js';

const router = Router();

router.get('/', authenticate, getSubjects);
router.post('/', authenticate, authorize('admin'), createSubject);
router.delete('/:id', authenticate, authorize('admin'), deleteSubject);

export default router;
