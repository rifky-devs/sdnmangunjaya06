import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import {
  createClass,
  deleteClass,
  getClasses
} from '../controllers/class.controller.js';

const router = Router();

router.get('/', authenticate, getClasses);
router.post('/', authenticate, authorize('admin'), createClass);
router.delete('/:id', authenticate, authorize('admin'), deleteClass);

export default router;
