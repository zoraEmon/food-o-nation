import express from 'express';
import { getAllDonationCenters,getDonationCenterById,createDonationCenter,deletedDonationCenter,updateDonationCenter} from '../controllers/donationCenter.controller.js';
import { validateCreateProgram } from '../middleware/program.middleware.js';
const router = express.Router();

// Route to get all programs
router.get('/', getAllDonationCenters);

// Route to get a program by ID
router.get('/:id', getDonationCenterById);

router.post('/addDonationCenter',createDonationCenter);
router.post('/updateDonationCenter/:id',updateDonationCenter);
router.post('/deleteDonationCenter/:id',deletedDonationCenter);
export default router;