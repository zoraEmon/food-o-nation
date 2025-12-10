import { Router } from 'express';
import { DonationController } from '../controllers/donation.controller.js';
import { upload } from '../middleware/upload.middleware.js';
// import { authenticateToken } from '../middleware/auth.middleware.js'; // Uncomment when auth is ready

const router = Router();
const donationController = new DonationController();

// ============================================
// DONATION ROUTES
// ============================================

/**
 * @route   POST /api/donations/monetary
 * @desc    Create a monetary donation
 * @access  Private (Donor)
 */
router.post(
  '/monetary',
  // authenticateToken, // Uncomment when auth middleware is ready
  (req, res) => donationController.createMonetaryDonation(req, res)
);

/**
 * @route   POST /api/donations/produce
 * @desc    Create a produce donation with scheduled drop-off
 * @access  Private (Donor)
 */
router.post(
  '/produce',
  // authenticateToken, // Uncomment when auth middleware is ready
  upload.array('images', 10), // Max 10 images
  (req, res) => donationController.createProduceDonation(req, res)
);

/**
 * @route   GET /api/donations/:id
 * @desc    Get donation by ID
 * @access  Private
 */
router.get(
  '/:id',
  // authenticateToken, // Uncomment when auth middleware is ready
  (req, res) => donationController.getDonationById(req, res)
);

/**
 * @route   GET /api/donations
 * @desc    Get donations with filters
 * @access  Private
 */
router.get(
  '/',
  // authenticateToken, // Uncomment when auth middleware is ready
  (req, res) => donationController.getDonations(req, res)
);

/**
 * @route   PATCH /api/donations/:id/status
 * @desc    Update donation status (Admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/:id/status',
  // authenticateToken, // Uncomment when auth middleware is ready
  // requireAdmin, // Add admin role check middleware
  (req, res) => donationController.updateDonationStatus(req, res)
);

export default router;