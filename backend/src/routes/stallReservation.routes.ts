import { Router } from 'express';
import { listProgramStalls, reserveStall, cancelStall, checkInStall, setProgramStallCapacity, getStallReservation, scanStallQr, cancelExpiredStalls, getProgramsWithDonorStatus } from '../controllers/stallReservation.controller.js';
import { getStallApplication, listStallApplications, scanStallApplicationQr, stallApplicationStats, cancelExpiredStallApplications } from '../controllers/stallApplication.controller.js';
import { authToken } from '../middleware/auth.middleware.js';

const router = Router();

// Get all programs with donor's stall reservation status (requires auth)
router.get('/programs-with-donor-status', authToken, getProgramsWithDonorStatus);

// List reservations for a program
router.get('/programs/:programId/reservations', listProgramStalls);

// Reserve a stall for a donor (requires auth)
router.post('/programs/:programId/reserve', authToken, reserveStall);
router.post('/programs/:programId/capacity', setProgramStallCapacity);

// Cancel a stall reservation
router.post('/reservations/:reservationId/cancel', cancelStall);

// Check-in at event
router.post('/reservations/:reservationId/check-in', checkInStall);

// Scan QR code (admin) to check-in
router.post('/scan-qr', scanStallQr);

// Cancel expired stalls (admin/cron)
router.post('/admin/update-expired', cancelExpiredStalls);

// Stall application endpoints
router.get('/applications/:applicationId', getStallApplication);
router.get('/programs/:programId/applications', listStallApplications);
router.get('/programs/:programId/applications/stats', stallApplicationStats);
router.post('/applications/scan-qr', scanStallApplicationQr);
router.post('/applications/admin/update-expired', cancelExpiredStallApplications);

// Get a reservation (includes QR fields)
router.get('/reservations/:reservationId', getStallReservation);

export default router;
