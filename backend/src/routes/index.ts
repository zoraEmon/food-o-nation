import express from 'express';
import authRoutes from './auth.routes.js';
import programRoutes from './program.routes.js';
import placeRoutes from './place.routes.js';
import beneficiaryRoutes from './beneficiary.routes.js';
import donorRoutes from './donor.routes.js';
// ruta for auth related endpoints [29/11/2025]
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/programs', programRoutes);
router.use('/place', placeRoutes);
router.use('/beneficiary', beneficiaryRoutes);
router.use('/donor', donorRoutes);
export default router;