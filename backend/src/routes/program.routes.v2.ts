import express from 'express';
import { createProgram, getAllPrograms, getProgramById, updateProgram, publishProgram, cancelProgram } from '../controllers/program.controller.v2.js';
import { 
  registerForProgram,
  getApplicationById,
  getBeneficiaryApplications,
  scanQRCode,
  getApplicationsByProgram,
  getApplicationStats,
  updateExpiredApplications,
} from '../controllers/program.controller.js';
import { validateCreateProgram, validateUpdateProgram } from '../middleware/program.middleware.js';

const router = express.Router();

// =========================================================
// PROGRAM ENDPOINTS
// =========================================================

// Public routes
router.get('/', getAllPrograms);
router.get('/:id', getProgramById);

// Admin routes - Create
router.post('/', validateCreateProgram, createProgram);

// Admin routes - Update
router.patch('/:id', validateUpdateProgram, updateProgram);

// Admin routes - Publish/Approve
router.post('/:id/publish', publishProgram);

// Admin routes - Cancel
router.post('/:id/cancel', cancelProgram);

// =========================================================
// PROGRAM APPLICATION ENDPOINTS
// =========================================================

// Register beneficiary for program (create registration + application with QR)
router.post('/register', registerForProgram);

// Get application by ID
router.get('/application/:applicationId', getApplicationById);

// Get all applications for a beneficiary
router.get('/beneficiary/:beneficiaryId/applications', getBeneficiaryApplications);

// Get all applications for a program (admin)
router.get('/:programId/applications', getApplicationsByProgram);

// Get application statistics for a program (admin)
router.get('/:programId/applications/stats', getApplicationStats);

// Scan QR code (admin)
router.post('/scan-qr', scanQRCode);

// Update expired applications (admin - batch job)
router.post('/admin/update-expired', updateExpiredApplications);

export default router;
