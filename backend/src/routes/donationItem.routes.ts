import express from 'express';
import { createDonationItem, getAllDonationsItems, getDonationItemById, deletedDonationItem, updateDonationItem } from '../controllers/donationItem.controller.js';
const router = express.Router();

// Route to get all programs
router.get('/', getAllDonationsItems);

// Route to get a program by ID
router.get('/:id', getDonationItemById);

router.post('/addDonationItem',createDonationItem);
router.post('/updateDonationItem/:id',updateDonationItem);
router.post('/deleteDonationItem/:id',deletedDonationItem);
export default router;