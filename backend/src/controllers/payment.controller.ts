import { Request, Response } from 'express';
import { PaymentGatewayService } from '../services/paymentGateway.service.js';

const paymentGateway = new PaymentGatewayService();

export class PaymentController {
  async createMayaCheckout(req: Request, res: Response): Promise<void> {
    try {
      const { amount, description } = req.body || {};
      const parsedAmount = Number(amount);
      if (!parsedAmount || parsedAmount <= 0) {
        res.status(400).json({ success: false, message: 'Invalid amount' });
        return;
      }

      const result = await paymentGateway.createMayaCheckout(parsedAmount, description);
      if (!result.success) {
        res.status(400).json({ success: false, message: result.failureReason || 'Failed to create Maya checkout' });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          checkoutId: result.checkoutId,
          redirectUrl: result.redirectUrl,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Internal error' });
    }
  }
}
