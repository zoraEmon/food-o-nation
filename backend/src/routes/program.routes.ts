import express from 'express';
import { 
  getAllPrograms, 
  getProgramById,
  createProgram,
  updateProgram,
  registerForProgram,
  getApplicationById,
  getBeneficiaryApplications,
  scanQRCode,
  getApplicationsByProgram,
  getApplicationStats,
  updateExpiredApplications,
} from '../controllers/program.controller.js';
import { validateCreateProgram } from '../middleware/program.middleware.js';

const router = express.Router();

// =========================================================
// PROGRAM ENDPOINTS
// =========================================================

// Get all programs
router.get('/', getAllPrograms);

// Get program by ID
router.get('/:id', getProgramById);

// Create a new program (admin)
router.post('/addprogram', validateCreateProgram, createProgram);

// Update program (admin)
router.put('/:id', updateProgram);

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