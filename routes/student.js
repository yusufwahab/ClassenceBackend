import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDashboard, markAttendance, getUpdates, getAttendanceLog } from '../controllers/studentController.js';
import { getActiveSessions, markSessionAttendance } from '../controllers/subjectController.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, getDashboard);
// router.post('/attendance', authenticateToken, markAttendance); // Disabled - using session-based attendance
router.get('/updates', authenticateToken, getUpdates);
router.get('/attendance-log', authenticateToken, getAttendanceLog);
router.get('/active-sessions', authenticateToken, getActiveSessions);
router.post('/attendance/:sessionId', authenticateToken, markSessionAttendance);

export default router;