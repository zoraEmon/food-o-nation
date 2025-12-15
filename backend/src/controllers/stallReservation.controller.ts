import { Request, Response } from 'express';
import { StallReservationService } from '../services/stallReservation.service.js';

const service = new StallReservationService();
// Controller for stall reservations
// Controller for stall reservations

export const listProgramStalls = async (req: Request, res: Response) => {
  try {
    const { programId } = req.params;
    const data = await service.listByProgram(programId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const reserveStall = async (req: Request, res: Response) => {
  try {
    const { programId } = req.params;
    const { donorId } = req.body; // expects donorId from authenticated donor or admin action
    const created = await service.reserveSlot(programId, donorId);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const cancelStall = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params;
    const updated = await service.cancelReservation(reservationId);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const checkInStall = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params;
    const updated = await service.checkIn(reservationId);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const scanStallQr = async (req: Request, res: Response) => {
  try {
    const { qrCodeRef } = req.body;
    if (!qrCodeRef) return res.status(400).json({ success: false, message: 'qrCodeRef is required' });
    const updated = await service.scanByQr(qrCodeRef);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getStallReservation = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params;
    const reservation = await service.getReservation(reservationId);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, data: reservation });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const setProgramStallCapacity = async (req: Request, res: Response) => {
  try {
    const { programId } = req.params;
    const { capacity } = req.body;
    if (typeof capacity !== 'number' || capacity < 0) {
      return res.status(400).json({ success: false, message: 'Invalid capacity' });
    }
    const updated = await service.setCapacity(programId, capacity);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const cancelExpiredStalls = async (_req: Request, res: Response) => {
  try {
    const result = await service.cancelExpiredStalls();
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
