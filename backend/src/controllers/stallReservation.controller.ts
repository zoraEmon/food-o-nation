import { Request, Response } from 'express';
import { StallReservationService } from '../services/stallReservation.service.js';
import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';

const service = new StallReservationService();
const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();

/**
 * Get all programs with donor's stall reservation status
 * Shows which programs donor has reserved stalls for and available stall slots
 */
export const getProgramsWithDonorStatus = async (req: Request, res: Response) => {
  try {
    console.log('[getProgramsWithDonorStatus] Request received');
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      console.log('[getProgramsWithDonorStatus] No userId in token');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    console.log('[getProgramsWithDonorStatus] UserId:', userId);

    // Get donor from userId
    const donor = await prisma.donor.findUnique({
      where: { userId }
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }

    // Fetch all programs that have stall capacity
    const programs = await prisma.program.findMany({
      where: {
        stallCapacity: {
          gt: 0
        }
      },
      orderBy: {
        date: 'asc'
      },
      include: {
        place: true,
        _count: {
          select: {
            stallReservations: true
          }
        }
      }
    });

    // Fetch donor's stall reservations
    const donorReservations = await prisma.stallReservation.findMany({
      where: {
        donorId: donor.id
      },
      select: {
        programId: true,
        status: true,
        reservedAt: true,
        slotNumber: true,
        id: true
      }
    });

    // Create a map of donor's reservations by programId
    const reservationsMap = new Map(
      donorReservations.map(res => [res.programId, res])
    );

    // Enrich programs with donor status and stall slots info
    const enrichedPrograms = programs.map(program => {
      const donorReservation = reservationsMap.get(program.id);
      const reservedStalls = program._count.stallReservations;
      const availableStalls = program.stallCapacity ? program.stallCapacity - reservedStalls : 0;
      const isFull = program.stallCapacity ? reservedStalls >= program.stallCapacity : false;

      return {
        ...program,
        reservedStalls,
        availableStalls,
        isFull,
        donorHasReserved: !!donorReservation,
        donorReservationStatus: donorReservation?.status || null,
        donorReservedAt: donorReservation?.reservedAt || null,
        donorSlotNumber: donorReservation?.slotNumber || null,
        donorReservationId: donorReservation?.id || null
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedPrograms
    });

  } catch (error: any) {
    console.error('Error fetching programs with donor status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch programs',
      error: error.message
    });
  }
};

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
    let { donorId } = req.body;
    
    // If no donorId provided, derive from JWT token
    if (!donorId && (req as any).user?.userId) {
      const donor = await prisma.donor.findUnique({
        where: { userId: (req as any).user.userId }
      });
      if (donor) {
        donorId = donor.id;
      }
    }
    
    if (!donorId) {
      return res.status(400).json({ success: false, message: 'Donor ID is required' });
    }
    
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
