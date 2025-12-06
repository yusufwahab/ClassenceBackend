import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  getDashboard,
  getStudents,
  getTodayAttendance,
  postUpdate,
  editUpdate,
  getAdminUpdates,
  deleteUpdate,
  exportAttendance
} from '../controllers/adminController.js';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// Students management
router.get('/students', getStudents);

// Attendance
router.get('/attendance/today', getTodayAttendance);
router.get('/attendance/export', exportAttendance);

// Updates management
router.post('/updates', postUpdate);
router.get('/updates', getAdminUpdates);
router.put('/updates/:id', editUpdate);
router.delete('/updates/:id', deleteUpdate);

export default router;