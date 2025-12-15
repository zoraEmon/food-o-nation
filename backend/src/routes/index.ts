import express from 'express';
import authRoutes from './auth.routes.js';
import programRoutes from './program.routes.v2.js';
import placeRoutes from './place.routes.js';
import donationRoutes from './donation.routes.js';
import beneficiaryRoutes from './beneficiary.routes.js';
import donorRoutes from './donor.routes.js';
import stallReservationRoutes from './stallReservation.routes.js';

// ruta for auth related endpoints [29/11/2025]
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/programs', programRoutes);
router.use('/places', placeRoutes);
router.use('/donations', donationRoutes);
router.use('/beneficiaries', beneficiaryRoutes);
router.use('/donors', donorRoutes);
router.use('/', stallReservationRoutes);

export default router;