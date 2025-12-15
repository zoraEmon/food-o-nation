import { Request, Response } from 'express';
import { reviewBeneficiaryService } from '../services/beneficiary.service.js';

export const reviewBeneficiary = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approved, reason } = req.body as { approved: boolean; reason?: string };
  if (typeof approved !== 'boolean') {
    return res.status(400).json({ success: false, message: 'approved must be boolean' });
  }

  try {
    const beneficiary = await reviewBeneficiaryService(id, approved, reason);
    res.json({ success: true, data: beneficiary });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    }
    res.status(500).json({ success: false, message: error?.message || 'Failed to review beneficiary' });
  }
};
