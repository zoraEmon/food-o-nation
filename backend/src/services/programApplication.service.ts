import { PrismaClient } from '../../generated/prisma/index.js';
import { QRCodeService } from './qrcode.service.js';
import { EmailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const qrCodeService = new QRCodeService();
const emailService = new EmailService();

/**
 * Create a program application when a beneficiary registers for a program
 * This generates a QR code, stores it, and sends email notification
 */
export const createProgramApplicationService = async (
  programRegistrationId: string,
  beneficiaryEmail: string,
  beneficiaryName: string,
  programTitle: string,
  programDate: Date
) => {
  try {
    // Fetch the registration with related data
    const registration = await prisma.programRegistration.findUnique({
      where: { id: programRegistrationId },
      include: {
        program: {
          include: { place: true },
        },
        beneficiary: true,
      },
    });

    if (!registration) {
      throw new Error('Program registration not found');
    }

    // Generate unique QR code value (can be UUID or any unique identifier)
    const qrCodeValue = uuidv4();

    // Generate QR code image (data URL format for email)
    const qrCodeImageUrl = await qrCodeService.generateQRCode(qrCodeValue);

    // Set scheduled delivery date to program date
    const scheduledDeliveryDate = new Date(programDate);

    // Create program application
    const application = await prisma.programApplication.create({
      data: {
        qrCodeValue,
        qrCodeImageUrl,
        scheduledDeliveryDate,
        // set both for backward compatibility with legacy column
        registrationId: programRegistrationId,
        programRegistrationId: programRegistrationId,
      },
      include: {
        registration: {
          include: {
            program: {
              include: { place: true },
            },
            beneficiary: {
              include: { address: true },
            },
          },
        },
      },
    });

    // Send QR code via email
    await sendApplicationQRCodeEmail(
      beneficiaryEmail,
      beneficiaryName,
      programTitle,
      scheduledDeliveryDate,
      qrCodeImageUrl,
      registration.program.place?.name || 'Relief Distribution Center'
    );

    return application;
  } catch (error: any) {
    console.error('Error in createProgramApplicationService:', error);
    throw new Error(`Failed to create program application: ${error.message}`);
  }
};

/**
 * Send QR code via email to beneficiary
 */
export const sendApplicationQRCodeEmail = async (
  email: string,
  beneficiaryName: string,
  programTitle: string,
  deliveryDate: Date,
  qrCodeImageUrl: string,
  location: string
): Promise<void> => {
  const subject = '🎁 Food-O-Nation Program Application Approved - QR Code Attached';
  const formattedDate = deliveryDate.toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
      <h2 style="color: #004225;">Great News, ${beneficiaryName}!</h2>
      <p>Your application for the <strong>${programTitle}</strong> program has been approved! 🎉</p>
      
      <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffb000;">
        <h3 style="color: #004225; margin-top: 0;">Program Details</h3>
        <p><strong>Program:</strong> ${programTitle}</p>
        <p><strong>Scheduled Distribution Date:</strong> ${formattedDate}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p style="color: #d9534f; font-weight: bold;">⚠️ Important: Please bring a valid ID for verification on distribution day.</p>
      </div>

      <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="color: #004225;">Your QR Code</h3>
        <p>Please present or screenshot this QR code on the distribution day:</p>
        <img src="${qrCodeImageUrl}" alt="QR Code" style="max-width: 300px; height: auto; margin: 15px 0;" />
        <p style="font-size: 0.9em; color: #666;">Admin will scan this code to verify and complete your application.</p>
      </div>

      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #004225; margin-top: 0;">Distribution Day Checklist</h4>
        <ul style="color: #333;">
          <li>Bring a valid ID (Government ID, Passport, Driver's License)</li>
          <li>Have this QR code ready (on phone or printed)</li>
          <li>Arrive on time for the distribution</li>
          <li>Let admin scan your QR code for verification</li>
        </ul>
      </div>

      <p style="margin-top: 20px; font-size: 0.8em; color: #666;">If you have any questions, please contact us or visit our office.</p>
      <p style="font-size: 0.8em; color: #666;">Best regards,<br/><strong>The Food-O-Nation Team</strong></p>
    </div>
  `;

  await emailService.sendEmail(email, subject, htmlContent);
};

/**
 * Get program application by ID with all related data
 */
export const getProgramApplicationService = async (applicationId: string) => {
  try {
    const application = await prisma.programApplication.findUnique({
      where: { id: applicationId },
      include: {
        registration: {
          include: {
            program: {
              include: { place: true },
            },
            beneficiary: {
              include: { address: true },
            },
          },
        },
        scans: {
          include: {
            scannedByAdmin: true,
          },
          orderBy: { scannedAt: 'desc' },
        },
        qrCodeScannedByAdmin: true,
      },
    });

    return application;
  } catch (error: any) {
    console.error('Error in getProgramApplicationService:', error);
    throw new Error(`Failed to fetch program application: ${error.message}`);
  }
};

/**
 * Get all applications for a beneficiary
 */
export const getBeneficiaryApplicationsService = async (beneficiaryId: string) => {
  try {
    const applications = await prisma.programApplication.findMany({
      where: {
        registration: {
          beneficiaryId,
        },
      },
      include: {
        registration: {
          include: {
            program: {
              include: { place: true },
            },
            beneficiary: {
              include: { address: true },
            },
          },
        },
        scans: {
          include: {
            scannedByAdmin: true,
          },
          orderBy: { scannedAt: 'desc' },
        },
        qrCodeScannedByAdmin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications;
  } catch (error: any) {
    console.error('Error in getBeneficiaryApplicationsService:', error);
    throw new Error(`Failed to fetch beneficiary applications: ${error.message}`);
  }
};

/**
 * Scan QR code by admin - records scan event and updates status
 */
export const scanApplicationQRCodeService = async (
  qrCodeValue: string,
  adminId: string,
  notes?: string
) => {
  try {
    // Find application by QR code value
    const application = await prisma.programApplication.findUnique({
      where: { qrCodeValue },
      include: {
        registration: {
          include: {
            program: true,
            beneficiary: true,
          },
        },
        qrCodeScannedByAdmin: true,
      },
    });

    if (!application) {
      throw new Error('Invalid QR code - Application not found');
    }

    // Get current date for comparison
    const now = new Date();
    const deliveryDate = new Date(application.scheduledDeliveryDate);

    // Record the scan event in audit log
    const scan = await prisma.programApplicationScan.create({
      data: {
        applicationId: application.id,
        scannedByAdminId: adminId,
        notes,
      },
      include: {
        scannedByAdmin: true,
      },
    });

    // Update application with scan info and set status to COMPLETED
    const updatedApplication = await prisma.programApplication.update({
      where: { id: application.id },
      data: {
        qrCodeScannedAt: now,
        qrCodeScannedByAdminId: adminId,
        applicationStatus: 'COMPLETED',
        actualDeliveryDate: now,
      },
      include: {
        registration: {
          include: {
            program: true,
            beneficiary: true,
          },
        },
        scans: {
          include: {
            scannedByAdmin: true,
          },
          orderBy: { scannedAt: 'desc' },
        },
        qrCodeScannedByAdmin: true,
      },
    });

    // Optionally update the program registration status to CLAIMED if needed
    if (application.registrationId) {
      await prisma.programRegistration.update({
        where: { id: application.registrationId },
        data: { status: 'CLAIMED' },
      });
    }

    // Send confirmation email to beneficiary
    if (application.registration?.beneficiary.activeEmail) {
      await sendScanConfirmationEmail(
        application.registration.beneficiary.activeEmail,
        application.registration.beneficiary.firstName,
        application.registration.program.title
      );
    }

    return {
      success: true,
      message: 'QR code scanned and application marked as COMPLETED',
      application: updatedApplication,
      scan,
    };
  } catch (error: any) {
    console.error('Error in scanApplicationQRCodeService:', error);
    throw new Error(`Failed to scan QR code: ${error.message}`);
  }
};

/**
 * Send scan confirmation email to beneficiary
 */
export const sendScanConfirmationEmail = async (
  email: string,
  beneficiaryName: string,
  programTitle: string
): Promise<void> => {
  const subject = '✅ Your Food-O-Nation Application Distribution Completed';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
      <h2 style="color: #004225;">Distribution Complete, ${beneficiaryName}!</h2>
      <p>Your application for the <strong>${programTitle}</strong> program has been verified and processed.</p>
      
      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h3 style="color: #004225; margin-top: 0;">✅ Status: COMPLETED</h3>
        <p>Your QR code has been scanned and your relief/food distribution has been recorded.</p>
      </div>

      <p>Thank you for participating in Food-O-Nation. We hope this support helps your family during this time.</p>
      <p style="margin-top: 20px; font-size: 0.8em; color: #666;">If you have any questions, please don't hesitate to contact us.</p>
      <p style="font-size: 0.8em; color: #666;">Best regards,<br/><strong>The Food-O-Nation Team</strong></p>
    </div>
  `;

  await emailService.sendEmail(email, subject, htmlContent);
};

/**
 * Check and update statuses for applications past their delivery date
 * Should be run periodically (e.g., daily batch job)
 */
export const updateExpiredApplicationStatusesService = async () => {
  try {
    const now = new Date();

    // Find all pending applications where delivery date has passed
    const expiredApplications = await prisma.programApplication.findMany({
      where: {
        applicationStatus: 'PENDING',
        scheduledDeliveryDate: {
          lt: now, // Less than today
        },
      },
    });

    // Update them to CANCELLED
    const updateResult = await prisma.programApplication.updateMany({
      where: {
        id: {
          in: expiredApplications.map((app) => app.id),
        },
      },
      data: {
        applicationStatus: 'CANCELLED',
      },
    });

    // Also update related program registrations to CANCELED
    for (const app of expiredApplications) {
      if (app.registrationId) {
        await prisma.programRegistration.update({
          where: { id: app.registrationId },
          data: { status: 'CANCELED' },
        });
      }
    }

    console.log(`Updated ${updateResult.count} expired applications to CANCELLED`);
    return { count: updateResult.count, applications: expiredApplications };
  } catch (error: any) {
    console.error('Error in updateExpiredApplicationStatusesService:', error);
    throw new Error(`Failed to update expired applications: ${error.message}`);
  }
};

/**
 * Get all applications for a specific program (for admin dashboard)
 */
export const getProgramApplicationsService = async (programId: string) => {
  try {
    const applications = await prisma.programApplication.findMany({
      where: {
        registration: {
          programId,
        },
      },
      include: {
        registration: {
          include: {
            beneficiary: {
              include: { address: true },
            },
          },
        },
        scans: {
          include: {
            scannedByAdmin: true,
          },
          orderBy: { scannedAt: 'desc' },
        },
        qrCodeScannedByAdmin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications;
  } catch (error: any) {
    console.error('Error in getProgramApplicationsService:', error);
    throw new Error(`Failed to fetch program applications: ${error.message}`);
  }
};

/**
 * Get application statistics for a program
 */
export const getProgramApplicationStatsService = async (programId: string) => {
  try {
    const applications = await prisma.programApplication.findMany({
      where: {
        registration: {
          programId,
        },
      },
    });

    const stats = {
      total: applications.length,
      pending: applications.filter((app) => app.applicationStatus === 'PENDING').length,
      completed: applications.filter((app) => app.applicationStatus === 'COMPLETED').length,
      cancelled: applications.filter((app) => app.applicationStatus === 'CANCELLED').length,
      scanRate: applications.length > 0
        ? ((applications.filter((app) => app.applicationStatus === 'COMPLETED').length / applications.length) * 100).toFixed(2) + '%'
        : '0%',
    };

    return stats;
  } catch (error: any) {
    console.error('Error in getProgramApplicationStatsService:', error);
    throw new Error(`Failed to fetch application stats: ${error.message}`);
  }
};
