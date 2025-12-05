import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDashboard, markAttendance, getUpdates } from '../controllers/studentController.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, getDashboard);
router.post('/attendance', authenticateToken, markAttendance);
router.get('/updates', authenticateToken, getUpdates);

export default router;