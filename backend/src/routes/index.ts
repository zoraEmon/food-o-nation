import express from 'express';
import authRoutes from './auth.routes.js';
import donationRoutes from './donation.routes.js';

// ruta for auth related endpoints [29/11/2025]
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/donations', donationRoutes);

export default router;