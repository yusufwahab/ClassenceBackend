import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDepartments } from '../controllers/sharedController.js';
import { getDashboard as getStudentDashboard } from '../controllers/studentController.js';
import { getDashboard as getAdminDashboard } from '../controllers/adminController.js';

const router = express.Router();

router.get('/departments', getDepartments);

router.get('/dashboard', authenticateToken, async (req, res) => {
  if (req.user.role === 'admin') {
    return getAdminDashboard(req, res);
  } else {
    return getStudentDashboard(req, res);
  }
});

export default router;