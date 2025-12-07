import express from 'express';
import { register, registerAdmin, login } from '../controllers/authController.js';
import { verifyEmail, resendVerificationCode } from '../controllers/verificationController.js';

const router = express.Router();

router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendVerificationCode);

export default router;