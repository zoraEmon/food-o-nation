import { PrismaClient, Donation, DonationStatus, DonationItem, Donor } from '../../generated/prisma/index.js';
import { QRCodeService } from './qrcode.service.js';
import { EmailService } from './email.service.js';

const prisma = new PrismaClient();
const qrcodeService = new QRCodeService();
const emailService = new EmailService();

export class DonationService {
  /**
   * Create a monetary donation with payment processing
   */
  async createMonetaryDonation(
    donorId: string,
    amount: number,
    paymentMethod: string,
    paymentReference: string
  ): Promise<Donation> {
    // Validate donor exists
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      include: { user: true },
    });

    if (!donor || !donor.user) {
      throw new Error('Donor not found');
    }

    // Placeholder for actual payment gateway integration
    // In production, this would call PayPal, GCash, or other payment APIs
    const paymentSuccessful = await this.processPayment(paymentMethod, amount, paymentReference);

    if (!paymentSuccessful) {
      // Notify donor about payment failure
      await emailService.sendPaymentFailureNotification(
        donor.user.email,
        donor.displayName,
        amount,
        'Payment processing failed. Please verify your payment details.'
      );
      throw new Error('Payment processing failed');
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        donor: { connect: { id: donorId } },
        status: DonationStatus.COMPLETED,
        scheduledDate: new Date(), // Monetary donations are completed immediately
        paymentMethod,
        paymentReference,
        items: {
          create: {
            name: 'Monetary Donation',
            category: 'Monetary',
            quantity: amount,
            unit: 'PHP',
          },
        },
      },
      include: {
        donor: { include: { user: true } },
        items: true,
      },
    });

    // Update donor's total donation and points
    await prisma.donor.update({
      where: { id: donorId },
      data: {
        totalDonation: {
          increment: amount,
        },
        points: {
          increment: Math.floor(amount / 10), // 1 point for every 10 PHP donated
        },
      },
    });

    // Send confirmation email to donor
    await emailService.sendMonetaryDonationConfirmation(
      donor.user.email,
      donor.displayName,
      amount,
      paymentReference,
      donation.id
    );

    // Notify all admins
    await emailService.notifyAdminMonetaryDonation(
      donor.user.email,
      donor.displayName,
      amount,
      paymentReference,
      donation.id
    );

    return donation;
  }

  /**
   * Create a produce donation with scheduled drop-off
   */
  async createProduceDonation(
    donorId: string,
    donationCenterId: string,
    scheduledDate: Date,
    items: { name: string; category: string; quantity: number; unit: string }[],
    imageUrls: string[]
  ): Promise<Donation> {
    // Validate donor exists
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      include: { user: true },
    });

    if (!donor || !donor.user) {
      throw new Error('Donor not found');
    }

    // Validate donation center exists
    const donationCenter = await prisma.donationCenter.findUnique({
      where: { id: donationCenterId },
      include: { place: true },
    });

    if (!donationCenter) {
      throw new Error('Donation center not found');
    }

    // Validate scheduled date is in the future
    if (scheduledDate <= new Date()) {
      throw new Error('Scheduled date must be in the future');
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        donor: { connect: { id: donorId } },
        status: DonationStatus.SCHEDULED,
        scheduledDate,
        donationCenter: { connect: { id: donationCenterId } },
        imageUrls,
        items: {
          createMany: {
            data: items,
          },
        },
      },
      include: {
        donor: { include: { user: true } },
        donationCenter: { include: { place: true } },
        items: true,
      },
    });

    // Generate QR code for the donation
    const qrCodeData = JSON.stringify({
      donationId: donation.id,
      donorId: donorId,
      scheduledDate: scheduledDate.toISOString(),
      type: 'PRODUCE_DONATION'
    });
    const qrCodeDataUrl = await qrcodeService.generateQRCode(qrCodeData);

    // Update donation with QR code reference
    const updatedDonation = await prisma.donation.update({
      where: { id: donation.id },
      data: { qrCodeRef: qrCodeDataUrl },
      include: {
        donor: { include: { user: true } },
        donationCenter: { include: { place: true } },
        items: true,
      },
    });

    // Send confirmation email to donor with QR code
    await emailService.sendProduceDonationConfirmation(
      donor.user.email,
      donor.displayName,
      scheduledDate,
      donationCenter.place?.name || 'Donation Center',
      donationCenter.place?.address || donationCenter.contactInfo,
      qrCodeDataUrl,
      donation.id,
      items
    );

    // Notify all admins about the scheduled donation
    await emailService.notifyAdminProduceDonation(
      donor.user.email,
      donor.displayName,
      scheduledDate,
      donationCenter.place?.name || 'Donation Center',
      donation.id,
      items
    );

    return updatedDonation;
  }

  /**
   * Get donation by ID with full details
   */
  async getDonationById(donationId: string): Promise<Donation | null> {
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        donor: { include: { user: true } },
        donationCenter: { include: { place: true } },
        items: true,
        program: true,
      },
    });

    return donation;
  }

  /**
   * Get donations with filters
   */
  async getDonations(filters: {
    donorId?: string;
    status?: DonationStatus;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ donations: Donation[]; total: number }> {
    const where: any = {};

    if (filters.donorId) {
      where.donorId = filters.donorId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fromDate || filters.toDate) {
      where.scheduledDate = {};
      if (filters.fromDate) {
        where.scheduledDate.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.scheduledDate.lte = filters.toDate;
      }
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          donor: { include: { user: true } },
          donationCenter: { include: { place: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0,
      }),
      prisma.donation.count({ where }),
    ]);

    return { donations, total };
  }

  /**
   * Update donation status (admin operation)
   */
  async updateDonationStatus(
    donationId: string,
    status: DonationStatus,
    notes?: string
  ): Promise<Donation> {
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { donor: { include: { user: true } } },
    });

    if (!donation) {
      throw new Error('Donation not found');
    }

    const updatedDonation = await prisma.donation.update({
      where: { id: donationId },
      data: { status },
      include: {
        donor: { include: { user: true } },
        donationCenter: { include: { place: true } },
        items: true,
      },
    });

    // If donation is completed, update donor points for produce donations
    if (status === DonationStatus.COMPLETED && donation.status !== DonationStatus.COMPLETED) {
      // Calculate points based on items (example: 1 point per kg/unit)
      const totalQuantity = await prisma.donationItem.aggregate({
        where: { donationId },
        _sum: { quantity: true },
      });

      if (totalQuantity._sum.quantity) {
        await prisma.donor.update({
          where: { id: donation.donorId! },
          data: {
            points: {
              increment: Math.floor(totalQuantity._sum.quantity),
            },
          },
        });
      }
    }

    return updatedDonation;
  }

  /**
   * Placeholder for payment processing
   * In production, integrate with actual payment gateway APIs
   */
  private async processPayment(
    paymentMethod: string,
    amount: number,
    paymentReference: string
  ): Promise<boolean> {
    // TODO: Implement actual payment gateway integration
    // For now, simulate successful payment
    console.log(`Processing payment: ${paymentMethod}, Amount: ${amount}, Ref: ${paymentReference}`);
    
    // Simulate payment validation
    if (!paymentReference || paymentReference.length < 5) {
      return false;
    }

    // In production, call the appropriate payment API here
    // Example: await gcashApi.verifyPayment(paymentReference);
    
    return true; // Simulate success
  }
}
