import express from 'express';
import {
  getPageDetails,
  updateLogo,
  updateAboutUs,
  updateSocialLinks,
  updateContactInfo,
} from '../controllers/updateDetails.controller.js';

const router = express.Router();

// ==============================
// PAGE DETAILS ROUTES
// ==============================

// Public route: Fetch all page details
router.get('/', getPageDetails);

// ==============================
// ADMIN ROUTES (PUT requests)
// ==============================

// Update logo
router.put('/logo', updateLogo);

// Update About Us section
router.put('/about-us', updateAboutUs);

// Update social media links
router.put('/social-links', updateSocialLinks);

// Update contact information
router.put('/contact-info', updateContactInfo);

export default router;