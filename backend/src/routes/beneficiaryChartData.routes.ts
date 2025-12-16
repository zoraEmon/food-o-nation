import express from 'express';
import { getBeneficiaryAddressCount,getBeneficiaryWithTheSameHouseholdNumber,getBeneficiaryMonthlyIncomeCount,getBeneficiaryEmpoymentStatus} from '../controllers/beneficiaryChartData.controller.js';

const router = express.Router();

// Route to get all programs
router.get('/BeneficiaryAddressCount', getBeneficiaryAddressCount);
router.get('/BeneficiaryWithTheSameHouseholdNumber', getBeneficiaryWithTheSameHouseholdNumber);
router.get('/BeneficiaryMonthlyIncomeCount', getBeneficiaryMonthlyIncomeCount);
router.get('/BeneficiaryEmpoymentStatus', getBeneficiaryEmpoymentStatus);
export default router;