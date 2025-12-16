import { Router } from 'express';
import { listDonors, getDonor, reviewDonor, getTopDonors } from '../controllers/donor.controller.js';

const router = Router();

router.get('/', listDonors);
router.get('/top/acknowledgement', getTopDonors);
router.get('/:id', getDonor);
router.post('/:id/review', reviewDonor);

export default router;
