import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';
import QRCode from 'qrcode';
import { StallApplicationService } from './stallApplication.service.ts';

const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();
const stallApplicationService = new StallApplicationService();

async function logActivity(userId: string | undefined, action: string, details?: string) {
  if (!userId || !prisma.activityLog) return;
  try {
    await prisma.activityLog.create({ data: { userId, action, details } });
  } catch (err) {
    console.error('Failed to log activity', err);
  }
}

export class StallReservationService {
  async listByProgram(programId: string) {
    const reservations = await prisma.stallReservation.findMany({
      where: { programId },
      include: { donor: true, program: true }
    });

    // Backfill QR codes for any legacy reservations without QR data
    return Promise.all(reservations.map((reservation:any) => this.ensureQr(reservation)));
  }

  async reserveSlot(programId: string, donorId: string) {
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) throw new Error('Program not found');

    const capacity = program.stallCapacity ?? 0;
    if (capacity <= 0) throw new Error('Program does not accept stall reservations');

    if (program.reservedStalls >= capacity) throw new Error('All stalls are already reserved');

    // prevent duplicate reservation by same donor in same program
    const existingForDonor = await prisma.stallReservation.findFirst({
      where: { programId, donorId, status: { in: ['PENDING', 'APPROVED', 'CHECKED_IN'] } }
    });
    if (existingForDonor) throw new Error('Donor already has a reservation for this program');

    // find next available slotNumber
    const existing = await prisma.stallReservation.findMany({
      where: { programId },
      select: { slotNumber: true }
    });
    const taken = new Set(existing.map(e => e.slotNumber));
    let next = 1;
    while (taken.has(next) && next <= capacity) next++;
    if (next > capacity) throw new Error('No available slot numbers');

    const reservation = await prisma.$transaction(async (tx:any) => {
      const created = await tx.stallReservation.create({
        data: {
          programId,
          donorId,
          slotNumber: next,
          status: 'APPROVED',
        },
        include: { donor: true, program: true }
      });

      // Generate QR code content and store as data URL
      const content = JSON.stringify({
        type: 'stall-reservation',
        reservationId: created.id,
        programId,
        donorId,
        slotNumber: next
      });
      const dataUrl = await QRCode.toDataURL(content);

      await tx.stallReservation.update({
        where: { id: created.id },
        data: { qrCodeUrl: dataUrl, qrCodeRef: `STALL-${programId}-${next}` }
      });

      await tx.program.update({
        where: { id: programId },
        data: { reservedStalls: { increment: 1 } }
      });

      const refreshed = await tx.stallReservation.findUnique({
        where: { id: created.id },
        include: { donor: true, program: true }
      });

      return refreshed!;
    });

    // Create application record with email + QR
    await stallApplicationService.createForReservation(reservation.id);

    const donor = await prisma.donor.findUnique({ where: { id: donorId }, include: { user: true } });
    await logActivity(donor?.user?.id, 'STALL_RESERVATION_CREATED', `Program ${programId} slot ${reservation.slotNumber}`);

    return reservation;
  }

  async cancelReservation(reservationId: string) {
    const reservation = await prisma.stallReservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED', canceledAt: new Date() },
      include: { program: true }
    });

    await prisma.stallApplication.updateMany({
      where: { stallReservationId: reservationId },
      data: { applicationStatus: 'CANCELLED' }
    });

    // decrement reserved stalls if was approved
    if (reservation.programId) {
      await prisma.program.update({
        where: { id: reservation.programId },
        data: { reservedStalls: { decrement: 1 } }
      });
    }

    return reservation;
  }

  async checkIn(reservationId: string) {
    const updated = await prisma.stallReservation.update({
      where: { id: reservationId },
      data: { status: 'CHECKED_IN', checkedInAt: new Date() }
    });
    const donor = updated.donorId
      ? await prisma.donor.findUnique({ where: { id: updated.donorId }, include: { user: true } })
      : null;
    await logActivity(donor?.user?.id, 'STALL_RESERVATION_CLAIMED', `Reservation ${reservationId} checked in`);
    return updated;
  }

  async scanByQr(qrCodeRef: string) {
    const reservation = await prisma.stallReservation.findFirst({
      where: { qrCodeRef },
      include: { donor: true, program: true }
    });

    if (!reservation) throw new Error('Invalid QR code - reservation not found');
    if (reservation.status === 'CANCELLED') throw new Error('Reservation is cancelled');
    if (reservation.status === 'CHECKED_IN') return reservation;

    return prisma.stallReservation.update({
      where: { id: reservation.id },
      data: { status: 'CHECKED_IN', checkedInAt: new Date() },
      include: { donor: true, program: true }
    });
  }

  async getReservation(reservationId: string) {
    const reservation = await prisma.stallReservation.findUnique({
      where: { id: reservationId },
      include: { donor: true, program: true }
    });

    return this.ensureQr(reservation);
  }

  async setCapacity(programId: string, capacity: number) {
    if (capacity < 0) throw new Error('Capacity cannot be negative');
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) throw new Error('Program not found');
    if (program.reservedStalls > capacity) throw new Error('Capacity less than already reserved stalls');
    return prisma.program.update({
      where: { id: programId },
      data: { stallCapacity: capacity }
    });
  }

  async cancelExpiredStalls() {
    const now = new Date();
    const expiring = await prisma.stallReservation.findMany({
      where: {
        status: { in: ['PENDING', 'APPROVED'] },
        program: { date: { lt: now } }
      },
      include: { program: true }
    });

    let cancelled = 0;

    await prisma.$transaction(async (tx:any) => {
      for (const res of expiring) {
        await tx.stallReservation.update({
          where: { id: res.id },
          data: { status: 'CANCELLED', canceledAt: now }
        });

        await tx.stallApplication.updateMany({
          where: { stallReservationId: res.id },
          data: { applicationStatus: 'CANCELLED' }
        });

        // decrement reservedStalls but not below zero
        await tx.program.update({
          where: { id: res.programId },
          data: {
            reservedStalls: {
              decrement: res.program.reservedStalls > 0 ? 1 : 0
            }
          }
        });

        cancelled += 1;
      }
    });

    return { cancelled };
  }

  private async ensureQr(reservation: any) {
    if (!reservation) return null;
    if (reservation.qrCodeUrl && reservation.qrCodeRef) return reservation;

    const content = JSON.stringify({
      type: 'stall-reservation',
      reservationId: reservation.id,
      programId: reservation.programId,
      donorId: reservation.donorId,
      slotNumber: reservation.slotNumber
    });
    const dataUrl = await QRCode.toDataURL(content);

    return prisma.stallReservation.update({
      where: { id: reservation.id },
      data: {
        qrCodeUrl: dataUrl,
        qrCodeRef: `STALL-${reservation.programId}-${reservation.slotNumber}`
      },
      include: { donor: true, program: true }
    });
  }
}
