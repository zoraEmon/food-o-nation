import { Request, Response } from 'express';
import { StallApplicationService } from '../services/stallApplication.service.js';

const service = new StallApplicationService();

export const getStallApplication = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const app = await service.getApplication(applicationId);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: app });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const listStallApplications = async (req: Request, res: Response) => {
  try {
    const { programId } = req.params;
    const apps = await service.listByProgram(programId);
    res.json({ success: true, data: apps });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const scanStallApplicationQr = async (req: Request, res: Response) => {
  try {
    const { qrCodeValue, adminId, notes } = req.body;
    if (!qrCodeValue) return res.status(400).json({ success: false, message: 'qrCodeValue is required' });
    const result = await service.scanApplication(qrCodeValue, adminId, notes);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const stallApplicationStats = async (req: Request, res: Response) => {
  try {
    const { programId } = req.params;
    const stats = await service.getStats(programId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const cancelExpiredStallApplications = async (_req: Request, res: Response) => {
  try {
    const result = await service.cancelExpired();
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
