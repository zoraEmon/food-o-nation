import { Router } from 'express';
import { listProgramStalls, reserveStall, cancelStall, checkInStall, setProgramStallCapacity, getStallReservation, scanStallQr, cancelExpiredStalls } from '../controllers/stallReservation.controller.js';
import { getStallApplication, listStallApplications, scanStallApplicationQr, stallApplicationStats, cancelExpiredStallApplications } from '../controllers/stallApplication.controller.js';

const router = Router();

// List reservations for a program
router.get('/programs/:programId/stalls', listProgramStalls);

// Reserve a stall for a donor
router.post('/programs/:programId/stalls/reserve', reserveStall);
router.post('/programs/:programId/stalls/capacity', setProgramStallCapacity);

// Cancel a stall reservation
router.post('/stalls/:reservationId/cancel', cancelStall);

// Check-in at event
router.post('/stalls/:reservationId/check-in', checkInStall);

// Scan QR code (admin) to check-in
router.post('/stalls/scan-qr', scanStallQr);

// Cancel expired stalls (admin/cron)
router.post('/stalls/admin/update-expired', cancelExpiredStalls);

// Stall application endpoints
router.get('/stalls/applications/:applicationId', getStallApplication);
router.get('/programs/:programId/stalls/applications', listStallApplications);
router.get('/programs/:programId/stalls/applications/stats', stallApplicationStats);
router.post('/stalls/applications/scan-qr', scanStallApplicationQr);
router.post('/stalls/applications/admin/update-expired', cancelExpiredStallApplications);

// Get a reservation (includes QR fields)
router.get('/stalls/:reservationId', getStallReservation);

export default router;
