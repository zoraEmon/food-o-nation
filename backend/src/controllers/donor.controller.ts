import { Request, Response } from 'express';
import { DonorService } from '../services/donor.service.js';

const donorService = new DonorService();

export const listDonors = async (req: Request, res: Response) => {
  try {
    const donors = await donorService.getAll();
    res.json({ success: true, data: donors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to list donors' });
  }
};

export const getDonor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const donor = await donorService.getById(id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
    res.json({ success: true, data: donor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch donor' });
  }
};

export const reviewDonor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approved, reason } = req.body as { approved: boolean; reason?: string };
  if (typeof approved !== 'boolean') {
    return res.status(400).json({ success: false, message: 'approved must be boolean' });
  }

  try {
    const donor = await donorService.reviewDonor(id, { approved, reason });
    res.json({ success: true, data: donor });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.status(500).json({ success: false, message: error?.message || 'Failed to review donor' });
  }
};
