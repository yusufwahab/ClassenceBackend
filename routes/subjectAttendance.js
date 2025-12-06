import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  markSubjectAttendance,
  getActiveSubjectSessions,
  createSubjectSession,
  getSubjectSessions,
  getSubjectAttendanceToday,
  fixAttendanceIndexes,
  editSubjectSession,
  endSubjectSession,
  deleteSubjectSession
} from '../controllers/subjectAttendanceController.js';

const router = express.Router();

// Admin routes
router.post('/sessions', authenticateToken, requireAdmin, createSubjectSession);
router.get('/sessions', authenticateToken, requireAdmin, getSubjectSessions);
router.get('/admin/today', authenticateToken, requireAdmin, getSubjectAttendanceToday);

// Student routes for subject attendance
router.get('/active', authenticateToken, getActiveSubjectSessions);
router.post('/mark/:sessionId', authenticateToken, markSubjectAttendance);
router.delete('/fix-indexes', authenticateToken, fixAttendanceIndexes);

// Admin session management
router.put('/sessions/:sessionId', authenticateToken, requireAdmin, editSubjectSession);
router.patch('/sessions/:sessionId/end', authenticateToken, requireAdmin, endSubjectSession);
router.delete('/sessions/:sessionId', authenticateToken, requireAdmin, deleteSubjectSession);

export default router;