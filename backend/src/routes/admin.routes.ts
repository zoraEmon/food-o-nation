import { Router } from 'express';
import {
  getDashboardStats,
  getRecentActivity,
  getAllBeneficiariesForAdmin,
  getBeneficiaryDetails,
  getBeneficiaryDetailsDebug,
  getAllDonorsForAdmin,
  getDonorDetails,
  touchDonor,
  approveBeneficiary,
  getDropoffSchedule,
  approveDonor,
  rejectBeneficiary,
  rejectDonor,
  touchBeneficiary,
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
// Touch updatedAt (used when admin opens/reviews an application)
router.patch('/beneficiaries/:id/touch', authToken, touchBeneficiary);

// Dashboard statistics
router.get('/dashboard-stats', authToken, getDashboardStats);

// Recent activity logs
router.get('/recent-activity', authToken, getRecentActivity);

// Beneficiary management
router.get('/beneficiaries', authToken, getAllBeneficiariesForAdmin);
router.get('/beneficiaries/:id', authToken, getBeneficiaryDetails);
// Dev-only debug endpoint (no auth) for quick verification in local/dev environments
router.get('/debug/beneficiaries/:id', getBeneficiaryDetailsDebug);

// Donor management
router.get('/donors', authToken, getAllDonorsForAdmin);
router.get('/donors/:id', authToken, getDonorDetails);
// Touch donor updatedAt (used when admin opens/reviews an application)
router.patch('/donors/:id/touch', authToken, touchDonor);
// Approve/reject donor application
router.patch('/donors/:id/approve', authToken, approveDonor);
router.patch('/donors/:id/reject', authToken, rejectDonor);

// Drop-off schedule for non-monetary donations
router.get('/dropoff-schedule', authToken, getDropoffSchedule);

export default router;
