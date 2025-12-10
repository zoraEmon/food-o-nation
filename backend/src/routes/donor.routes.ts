import express from 'express';
import { getAllDonors,getDonorById, createDonor, updateDonor, deleteDonor } from '../controllers/donor.controller.js';
import { validateCreateProgram } from '../middleware/program.middleware.js';
const router = express.Router();

// Route to get all programs
router.get('/', getAllDonors);

// Route to get a program by ID
router.get('/:id', getDonorById);

router.post('/adddonor',createDonor);
router.post('/updatedonor/:id',updateDonor);
router.post('/deletedonor/:id',deleteDonor);
export default router;