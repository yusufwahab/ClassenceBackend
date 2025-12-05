import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { saveSignature, getProfile } from '../controllers/profileController.js';

const router = express.Router();

router.post('/signature', authenticateToken, saveSignature);
router.get('/me', authenticateToken, getProfile);

export default router;