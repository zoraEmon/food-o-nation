import { PrismaClient } from '../../generated/prisma/index.js';
import { QRCodeService } from './qrcode.service.js';
import { EmailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const qrCodeService = new QRCodeService();
const emailService = new EmailService();

export class StallApplicationService {
  async createForReservation(stallReservationId: string) {
    const reservation = await prisma.stallReservation.findUnique({
      where: { id: stallReservationId },
      include: {
        donor: { include: { user: true } },
        program: true,
      },
    });

    if (!reservation) throw new Error('Stall reservation not found');

    const qrCodeValue = uuidv4();
    const qrCodeImageUrl = await qrCodeService.generateQRCode(qrCodeValue);

    const application = await prisma.stallApplication.create({
      data: {
        stallReservationId,
        qrCodeValue,
        qrCodeImageUrl,
        scheduledDate: reservation.program.date,
      },
      include: {
        stallReservation: {
          include: { donor: { include: { user: true } }, program: true },
        },
      },
    });

    const email = reservation.donor.user?.email || reservation.donor.userId;
    if (email) {
      await this.sendApplicationEmail(
        email,
        reservation.donor.displayName,
        reservation.program.title,
        reservation.program.date,
        qrCodeImageUrl,
        reservation.slotNumber
      );
    }

    return application;
  }

  async getApplication(applicationId: string) {
    return prisma.stallApplication.findUnique({
      where: { id: applicationId },
      include: {
        stallReservation: {
          include: { donor: { include: { user: true } }, program: true },
        },
        scans: { include: { scannedByAdmin: true }, orderBy: { scannedAt: 'desc' } },
        qrCodeScannedByAdmin: true,
      },
    });
  }

  async listByProgram(programId: string) {
    return prisma.stallApplication.findMany({
      where: { stallReservation: { programId } },
      include: {
        stallReservation: {
          include: { donor: { include: { user: true } }, program: true },
        },
        scans: { include: { scannedByAdmin: true }, orderBy: { scannedAt: 'desc' } },
        qrCodeScannedByAdmin: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async scanApplication(qrCodeValue: string, adminId?: string, notes?: string) {
    const application = await prisma.stallApplication.findUnique({
      where: { qrCodeValue },
      include: {
        stallReservation: { include: { donor: { include: { user: true } }, program: true } },
      },
    });

    if (!application) throw new Error('Invalid QR code - Stall application not found');
    if (application.applicationStatus === 'CANCELLED') throw new Error('Application is cancelled');
    const now = new Date();

    const scan = await prisma.stallApplicationScan.create({
      data: {
        stallApplicationId: application.id,
        scannedByAdminId: adminId,
        notes,
      },
      include: { scannedByAdmin: true },
    });

    const updatedApp = await prisma.stallApplication.update({
      where: { id: application.id },
      data: {
        applicationStatus: 'COMPLETED',
        qrCodeScannedAt: now,
        qrCodeScannedByAdminId: adminId,
      },
      include: {
        stallReservation: { include: { donor: { include: { user: true } }, program: true } },
        scans: { include: { scannedByAdmin: true }, orderBy: { scannedAt: 'desc' } },
        qrCodeScannedByAdmin: true,
      },
    });

    await prisma.stallReservation.update({
      where: { id: application.stallReservationId },
      data: { status: 'CHECKED_IN', checkedInAt: now },
    });

    const email = application.stallReservation?.donor.user?.email;
    if (email) {
      await this.sendCompletionEmail(
        email,
        application.stallReservation.donor.displayName,
        application.stallReservation.program.title,
        application.stallReservation.slotNumber
      );
    }

    return { application: updatedApp, scan };
  }

  async cancelExpired() {
    const now = new Date();
    const expiring = await prisma.stallApplication.findMany({
      where: {
        applicationStatus: 'PENDING',
        OR: [
          { scheduledDate: { lt: now } },
          { stallReservation: { program: { date: { lt: now } } } },
        ],
      },
      include: { stallReservation: { include: { program: true } } },
    });

    let cancelled = 0;
    await prisma.$transaction(async (tx) => {
      for (const app of expiring) {
        await tx.stallApplication.update({
          where: { id: app.id },
          data: { applicationStatus: 'CANCELLED' },
        });
        await tx.stallReservation.update({
          where: { id: app.stallReservationId },
          data: { status: 'CANCELLED', canceledAt: now },
        });
        await tx.program.update({
          where: { id: app.stallReservation.programId },
          data: {
            reservedStalls: {
              decrement: app.stallReservation.program.reservedStalls > 0 ? 1 : 0,
            },
          },
        });
        cancelled += 1;
      }
    });

    return { cancelled };
  }

  async getStats(programId: string) {
    const apps = await prisma.stallApplication.findMany({
      where: { stallReservation: { programId } },
    });
    const total = apps.length;
    const pending = apps.filter((a) => a.applicationStatus === 'PENDING').length;
    const completed = apps.filter((a) => a.applicationStatus === 'COMPLETED').length;
    const cancelled = apps.filter((a) => a.applicationStatus === 'CANCELLED').length;
    return {
      total,
      pending,
      completed,
      cancelled,
      scanRate: total > 0 ? `${((completed / total) * 100).toFixed(2)}%` : '0%',
    };
  }

  private async sendApplicationEmail(
    email: string,
    donorName: string,
    programTitle: string,
    programDate: Date,
    qrCodeImageUrl: string,
    slotNumber: number
  ) {
    const formattedDate = programDate.toLocaleDateString('en-PH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
        <h2 style="color: #004225;">Stall Reservation Confirmed</h2>
        <p>Hi ${donorName}, your stall reservation for <strong>${programTitle}</strong> is confirmed.</p>
        <p><strong>Slot:</strong> #${slotNumber}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <div style="background:#fff;padding:16px;border-radius:8px;margin:16px 0;text-align:center;">
          <h3 style="color:#004225;">Your Stall QR</h3>
          <img src="${qrCodeImageUrl}" alt="Stall QR" style="max-width:260px;height:auto;" />
          <p style="color:#666;font-size:0.9em;">Present this QR at check-in.</p>
        </div>
      </div>
    `;
    await emailService.sendEmail(email, 'Your Stall Reservation QR', html);
  }

  private async sendCompletionEmail(
    email: string,
    donorName: string,
    programTitle: string,
    slotNumber: number
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
        <h2 style="color: #004225;">Stall Check-in Completed</h2>
        <p>Hi ${donorName}, your stall check-in for <strong>${programTitle}</strong> is recorded.</p>
        <p><strong>Slot:</strong> #${slotNumber}</p>
      </div>
    `;
    await emailService.sendEmail(email, 'Stall Check-in Receipt', html);
  }
}
