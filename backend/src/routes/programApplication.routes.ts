import { Router } from 'express';
import { getProgramsWithUserStatus, applyForProgram } from '../controllers/programApplication.controller.js';
import { authToken } from '../middleware/auth.middleware.js';

const router = Router();

// Get all programs with user's application status (requires auth)
router.get('/with-status', authToken, getProgramsWithUserStatus);

// Apply for a program (requires auth)
router.post('/apply', authToken, applyForProgram);

export default router;
