import express from 'express';
import authRoutes from './auth.routes.js';
import programRoutes from './program.routes.v2.js';
import placeRoutes from './place.routes.js';
import donationRoutes from './donation.routes.js';
import beneficiaryRoutes from './beneficiary.routes.js';
import donorRoutes from './donor.routes.js';
import stallReservationRoutes from './stallReservation.routes.js';
import paymentRoutes from './payment.routes.js';
import newsletterRoutes from './newsletter.routes.js';
import programRigerstationRoutes from './programRegisteration.routes.js';
import donationItemRoutes from './donationItem.routes.js';
import donationCenterRoutes from './donationCenter.routes.js';
import benificaryAddressCountRoutes from './beneficiaryChartData.routes.js';
import updateDetailsRoutes from './updateDetails.routers.js'; // Page details routes
import programApplicationRoutes from './programApplication.routes.js';
import metricsRoutes from './metrics.routes.js';
import adminRoutes from './admin.routes.js';
import questionRoutes from './question.routes.js';
import psgcRoutes from './psgc.routes.js';

// ruta for auth related endpoints [29/11/2025]
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/programs', programRoutes);
router.use('/places', placeRoutes);
router.use('/donations', donationRoutes);
router.use('/beneficiaries', beneficiaryRoutes);
router.use('/donors', donorRoutes);
router.use('/donationCenter', donationCenterRoutes);
router.use('/payments', paymentRoutes);
router.use('/newsletters', newsletterRoutes);
router.use('/program-applications', programApplicationRoutes);
router.use('/metrics', metricsRoutes);
router.use('/stalls', stallReservationRoutes);
router.use('/programRegistration', programRigerstationRoutes);
router.use('/donationItem', donationItemRoutes);
router.use('/beneficiaryChartData', benificaryAddressCountRoutes);
router.use('/page-details', updateDetailsRoutes);

router.use('/', questionRoutes);
router.use('/admin', adminRoutes);
router.use('/psgc', psgcRoutes);


export default router;