import express from 'express';
import { getAllBeneficiary,getBeneficiaryId,createBeneficiary,updateBeneficiary,deleteBeneficiary} from '../controllers/beneficiary.controller.js';
import { validateCreateProgram } from '../middleware/program.middleware.js';
const router = express.Router();

// Route to get all programs
router.get('/', getAllBeneficiary);

// Route to get a program by ID
router.get('/:id', getBeneficiaryId);

router.post('/addbeneficiary',createBeneficiary);
router.post('/updatebeneficiary/:id',updateBeneficiary);
router.post('/deletebeneficiary/:id',deleteBeneficiary);
export default router;