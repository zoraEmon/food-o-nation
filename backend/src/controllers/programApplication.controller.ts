import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';
import { QRCodeService } from '../services/qrcode.service.js';
import { EmailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();
const qrCodeService = new QRCodeService();
const emailService = new EmailService();

/**
 * Get all programs with user's application status
 * Shows which programs user has applied to and available slots
 */
export const getProgramsWithUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get beneficiary from userId
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { userId }
    });

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary profile not found'
      });
    }

    // Fetch all programs with place information for location display
    const programs = await prisma.program.findMany({
      orderBy: {
        date: 'asc'
      },
      include: {
        place: {
          select: {
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          }
        },
        _count: {
          select: {
            registrations: true
          }
        }
      }
    });

    // Fetch user's registrations
    const userRegistrations = await prisma.programRegistration.findMany({
      where: {
        beneficiaryId: beneficiary.id
      },
      select: {
        programId: true,
        status: true,
        registeredAt: true
      }
    });

    // Create a map of user's registrations by programId
    const registrationsMap = new Map(
      userRegistrations.map((reg: any) => [reg.programId, reg])
    );

    // Enrich programs with user status and slots info
    const enrichedPrograms = programs.map((program: any) => {
      const userRegistration: any = registrationsMap.get(program.id);
      const claimedSlots = program._count.registrations;
      const availableSlots = program.maxParticipants ? program.maxParticipants - claimedSlots : null;
      const isFull = program.maxParticipants ? claimedSlots >= program.maxParticipants : false;

      return {
        ...program,
        // Normalize a top-level location string for consumers that expect it
        location: program.place?.address || program.place?.name || null,
        claimedSlots,
        availableSlots,
        isFull,
        userHasApplied: !!userRegistration,
        userApplicationStatus: userRegistration?.status || null,
        userAppliedAt: userRegistration?.registeredAt || null
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedPrograms
    });

  } catch (error: any) {
    console.error('Error fetching programs with user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch programs',
      error: error.message
    });
  }
};

/**
 * Apply for a program
 */
export const applyForProgram = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { programId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!programId) {
      return res.status(400).json({
        success: false,
        message: 'Program ID is required'
      });
    }

    // Get beneficiary from userId
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            status: true
          }
        }
      }
    });

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary profile not found'
      });
    }

    // Check if user status allows program applications
    if (beneficiary.user.status === 'PENDING') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. You cannot apply for programs until your account is approved.'
      });
    }

    if (beneficiary.user.status !== 'APPROVED' && beneficiary.user.status !== 'VERIFIED') {
      return res.status(403).json({
        success: false,
        message: 'Your account status does not allow program applications. Please contact support.'
      });
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    // Check if user already registered
    const existingRegistration = await prisma.programRegistration.findFirst({
      where: {
        programId,
        beneficiaryId: beneficiary.id
      }
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this program',
        registrationStatus: existingRegistration.status
      });
    }

    // Check if program is full
    if (program.maxParticipants && program._count.registrations >= program.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'This program is already full'
      });
    }

    // Create registration
    const registration = await prisma.programRegistration.create({
      data: {
        programId,
        beneficiaryId: beneficiary.id,
        status: 'PENDING'
      },
      include: {
        program: {
          select: {
            title: true,
            date: true
          }
        }
      }
    });

    // Generate QR code for the application
    const qrCodeValue = uuidv4(); // Unique identifier for this application
    const scheduledDeliveryDate = program.date; // Use program date as scheduled delivery

    const qrCodeImageUrl = await qrCodeService.generateQRCode(qrCodeValue);

    // Create program application with QR code
    const application = await prisma.programApplication.create({
      data: {
        registrationId: registration.id,
        qrCodeValue,
        qrCodeImageUrl,
        scheduledDeliveryDate,
        applicationStatus: 'PENDING'
      }
    });

    // Get beneficiary email from user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    // Send QR code via email
    if (user?.email) {
      // Generate QR code as buffer for email attachment
      const qrCodeBuffer = await qrCodeService.generateQRCodeBuffer(qrCodeValue);
      
      const emailSubject = `Registration Confirmation - ${program.title}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px;">
            <h2 style="color: #004225; text-align: center;">Registration Confirmed!</h2>
            <p>Dear ${beneficiary.firstName} ${beneficiary.lastName},</p>
            <p>You have successfully registered for:</p>
            <div style="background-color: #FAF7F0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #FFB000; margin: 0 0 10px 0;">${program.title}</h3>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(program.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #FFB000;">PENDING</span></p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-weight: bold; color: #004225; margin-bottom: 10px;">Your QR Code:</p>
              <img src="cid:qrcode" alt="Registration QR Code" style="width: 250px; height: 250px; border: 3px solid #004225; border-radius: 10px;" />
              <p style="font-size: 12px; color: #666; margin-top: 10px;">Please present this QR code at the program venue</p>
            </div>
            <div style="background-color: #e8f4f8; padding: 15px; border-left: 4px solid #004225; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px;"><strong>Important:</strong> Save this email or take a screenshot of the QR code. You will need to present it at the program venue for check-in.</p>
            </div>
            <p style="margin-top: 30px; font-size: 0.9em; color: #666;">Best regards,<br/>The Food-O-Nation Team</p>
          </div>
        </div>
      `;

      const attachments = [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          cid: 'qrcode'
        }
      ];
      
      try {
        await emailService.sendEmail(user.email, emailSubject, emailHtml, attachments);
        console.log(`Registration QR code sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send QR code email:', emailError);
        // Don't fail the registration if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the program',
      data: {
        registration,
        qrCode: qrCodeImageUrl,
        qrCodeValue,
        programTitle: program.title,
        programDate: program.date
      }
    });

  } catch (error: any) {
    console.error('Error applying for program:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply for program',
      error: error.message
    });
  }
};
