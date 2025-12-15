import { Router } from 'express';
import { getAllBeneficiary, getBeneficiaryId } from '../controllers/Beneficiary.controller.js';
import { reviewBeneficiary } from '../controllers/beneficiary.review.controller.js';

const router = Router();

router.get('/', getAllBeneficiary);
router.get('/:id', getBeneficiaryId);
router.post('/:id/review', reviewBeneficiary);

export default router;
