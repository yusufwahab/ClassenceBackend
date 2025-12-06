import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  createSubject, 
  getSubjects, 
  createAttendanceSession,
  getAttendanceSessions,
  getActiveSessions,
  debugSessions,
  debugAttendance,
  deleteAttendance,
  clearAllAttendance,
  getTodayAttendance,
  getAdminTodayAttendance,
  markSessionAttendance 
} from '../controllers/subjectController.js';

const router = express.Router();

// Admin routes
router.post('/subjects', authenticateToken, requireAdmin, createSubject);
router.get('/subjects', authenticateToken, getSubjects);
router.post('/attendance-sessions', authenticateToken, requireAdmin, createAttendanceSession);
router.get('/attendance-sessions', authenticateToken, requireAdmin, getAttendanceSessions);
router.get('/admin/attendance/today', authenticateToken, requireAdmin, getAdminTodayAttendance);

// Student routes
router.get('/active-sessions', authenticateToken, getActiveSessions);
router.get('/debug-sessions', authenticateToken, debugSessions);
router.get('/debug-attendance/:sessionId', authenticateToken, debugAttendance);
router.delete('/attendance/:sessionId', authenticateToken, deleteAttendance);
router.delete('/attendance-clear-all', authenticateToken, clearAllAttendance);
router.get('/attendance/today', authenticateToken, getTodayAttendance);
router.post('/attendance/:sessionId', authenticateToken, markSessionAttendance);

export default router;