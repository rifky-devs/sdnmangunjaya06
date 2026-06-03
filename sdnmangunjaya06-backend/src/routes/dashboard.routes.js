import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import {
  getAdminDashboard,
  getGuruDashboard,
  getPublicStats
} from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/public', getPublicStats);
router.get('/admin', authenticate, authorize('admin'), getAdminDashboard);
router.get('/guru', authenticate, authorize('guru'), getGuruDashboard);

export default router;
