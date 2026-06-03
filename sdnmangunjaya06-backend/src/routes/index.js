import { Router } from 'express';
import authRoutes from './auth.routes.js';
import classRoutes from './class.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import gradeRoutes from './grade.routes.js';
import studentRoutes from './student.routes.js';
import subjectRoutes from './subject.routes.js';
import teacherRoutes from './teacher.routes.js';
import userRoutes from './user.routes.js';
import profileRoutes from './profile.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/grades', gradeRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);

export default router;
