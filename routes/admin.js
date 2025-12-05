import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getDashboard, getStudents, getTodayAttendance, postUpdate, editUpdate, getAdminUpdates, deleteUpdate, exportAttendance } from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, requireAdmin, getDashboard);
router.get('/students', authenticateToken, requireAdmin, getStudents);
router.get('/attendance/today', authenticateToken, requireAdmin, getTodayAttendance);
router.post('/updates', authenticateToken, requireAdmin, postUpdate);
router.get('/updates', authenticateToken, requireAdmin, getAdminUpdates);
router.put('/updates/:id', authenticateToken, requireAdmin, editUpdate);
router.delete('/updates/:id', authenticateToken, requireAdmin, deleteUpdate);
router.get('/attendance/export', authenticateToken, requireAdmin, exportAttendance);

export default router;