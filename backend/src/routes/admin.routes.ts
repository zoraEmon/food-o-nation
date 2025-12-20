import { Router } from 'express';
import {
  getDashboardStats,
  getRecentActivity,
  getAllBeneficiariesForAdmin,
  getBeneficiaryDetails,
  getAllDonorsForAdmin,
  getDonorDetails,
  approveBeneficiary,
  rejectBeneficiary,
  getPendingBeneficiaries,
  getPendingDonors,
  deleteBeneficiary,
  deleteDonor
} from '../controllers/admin.controller.js';
import { authToken } from '../middleware/auth.middleware.js';

const router = Router();

// Pending applications
router.get('/beneficiaries/pending', authToken, getPendingBeneficiaries);
router.get('/donors/pending', authToken, getPendingDonors);
// Delete applications
router.delete('/beneficiaries/:id', authToken, deleteBeneficiary);
router.delete('/donors/:id', authToken, deleteDonor);

// Approve/reject beneficiary application
router.patch('/beneficiaries/:id/approve', authToken, approveBeneficiary);
router.patch('/beneficiaries/:id/reject', authToken, rejectBeneficiary);

// Dashboard statistics
router.get('/dashboard-stats', authToken, getDashboardStats);

// Recent activity logs
router.get('/recent-activity', authToken, getRecentActivity);

// Beneficiary management
// Temporary test-only endpoint: returns beneficiary (with householdMembers) when provided the correct secret via ?secret=...
// NOTE: This endpoint is intentionally not authenticated via regular admin JWT; it is protected by an env var and intended for local testing only.
import { getBeneficiaryForTest } from '../controllers/admin.test.controller.js';
router.get('/beneficiaries/:id/verify', getBeneficiaryForTest);

router.get('/beneficiaries', authToken, getAllBeneficiariesForAdmin);
router.get('/beneficiaries/:id', authToken, getBeneficiaryDetails);

// Donor management
router.get('/donors', authToken, getAllDonorsForAdmin);
router.get('/donors/:id', authToken, getDonorDetails);

export default router;
