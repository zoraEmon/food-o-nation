import express from 'express';
import {
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  getNewsletterById,
  getAllNewsletters,
  getLatestNewsletters,
  upload,
} from '../controllers/newsletter.controller.js';
import { authToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// =========================================================
// NEWSLETTER/UPDATE ENDPOINTS
// =========================================================

// Get latest newsletters (public)
router.get('/latest', getLatestNewsletters);

// Get all newsletters with pagination (public)
router.get('/', getAllNewsletters);

// Get newsletter by ID (public)
router.get('/:id', getNewsletterById);

// Create newsletter (admin only) - supports multiple image uploads
router.post('/', authToken, upload.array('images', 5), createNewsletter);

// Update newsletter (admin only) - supports multiple image uploads
router.put('/:id', authToken, upload.array('images', 5), updateNewsletter);

// Delete newsletter (admin only)
router.delete('/:id', authToken, deleteNewsletter);

export default router;
