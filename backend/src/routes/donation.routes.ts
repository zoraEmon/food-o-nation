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
 * @route   POST /api/donations/maya/checkout
 * @desc    Initialize Maya Checkout and return checkoutId + redirectUrl
 * @access  Private (Donor)
 */
router.post(
  '/maya/checkout',
  // authenticateToken, // Uncomment when auth middleware is ready
  (req, res) => donationController.initMayaCheckout(req, res)
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
 * @route   POST /api/donations/scan-qr
 * @desc    Scan a donation QR code to mark drop-off
 * @access  Private (Admin/Staff)
 */
router.post(
  '/scan-qr',
  // authenticateToken, // Uncomment when auth middleware is ready
  (req, res) => donationController.scanDonationQr(req, res)
);

/**
 * @route   GET /api/donations/metrics/monetary
 * @desc    Get global total of verified monetary donations
 * @access  Private (Admin/Staff) — adjust when auth is ready
 */
router.get(
  '/metrics/monetary',
  // authenticateToken, // Uncomment when auth middleware is ready
  (req, res) => donationController.getMonetaryTotal(req, res)
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