import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';

const router = Router();
const controller = new PaymentController();

// POST /api/payments/maya/checkout -> { checkoutId, redirectUrl }
router.post('/maya/checkout', (req, res) => controller.createMayaCheckout(req, res));

export default router;
