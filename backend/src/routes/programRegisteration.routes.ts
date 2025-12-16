import express from 'express';
// import { getAllDonationCenters,getDonationCenterById,createDonationCenter,deletedDonationCenter,updateDonationCenter} from '../controllers/donationCenter.controller.js';
import { getAllProgramRegistrations,getProgramRegistrationById,createProgramRegistration,updateProgramRegistration,deleteProgramRegistration} from '../controllers/programRegistration.controller.js';
const router = express.Router();

// Route to get all programs
router.get('/', getAllProgramRegistrations);

// Route to get a program by ID
router.get('/:id', getProgramRegistrationById);

router.post('/addProgramRegistration',createProgramRegistration);
router.post('/updateProgramRegistration/:id',updateProgramRegistration);
router.post('/deleteProgramRegistration/:id',deleteProgramRegistration);
export default router;