import express from 'express';
import { getDepartments } from '../controllers/sharedController.js';

const router = express.Router();

router.get('/departments', getDepartments);

export default router;