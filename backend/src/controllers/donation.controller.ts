import { Request, Response } from 'express';
import { DonationService } from '../services/donation.service.js';
import { PaymentGatewayService } from '../services/paymentGateway.service.js';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';
import {
  createMonetaryDonationSchema,
  createProduceDonationSchema,
  updateDonationStatusSchema,
  getDonationsQuerySchema,
  scanDonationQrSchema,
} from '../utils/validators.js';
import { ZodError } from 'zod';

const donationService = new DonationService();
const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'foodONationSecret';

/**
 * Helper function to handle validation errors
 */
function handleValidationError(error: ZodError | any, res: Response): void {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    try { console.error('Zod validation errors (errors):', JSON.stringify(error.errors, null, 2)); } catch (e) {}
    try { console.error('Zod validation issues (issues):', JSON.stringify((error as any).issues, null, 2)); } catch (e) {}

    const rawIssues = (error as any).issues || (error as any).errors || [];
    const errors = rawIssues.map((err: any) => ({
      field: (err.path || []).join('.'),
      message: err.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  } else {
    res.status(400).json({
      success: false,
      message: error.message || 'Validation error',
    });
  }
}

/**
 * Helper function to handle service errors
 */
function handleServiceError(error: any, res: Response): void {
  console.error('Service error:', error);

  const message = String(error?.message || '').toLowerCase();

  // Map common service errors to appropriate HTTP status codes
  let statusCode = 500;
  if (message.includes('not found')) statusCode = 404;
  else if (message.includes('invalid') || message.includes('qr') || message.includes('does not match') || message.includes('cancelled')) statusCode = 400;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
}

export class DonationController {
  /**
   * Get global monetary total (verified donations only)
   * GET /api/donations/metrics/monetary
   */
  async getMonetaryTotal(req: Request, res: Response): Promise<void> {
    try {
      const total = await donationService.getMonetaryTotal();

      res.status(200).json({
        success: true,
        data: { total },
      });
    } catch (error) {
      handleServiceError(error, res);
    }
  }

  /**
   * Create a monetary donation
   * POST /api/donations/monetary
   */
  async createMonetaryDonation(req: Request, res: Response): Promise<void> {
    try {
      // Derive donorId from JWT if missing and strip guest fields for authenticated donors
      const body: any = { ...(req.body || {}) };
      if (!body.donorId && req.headers.authorization) {
        try {
          const token = (req.headers.authorization || '').split(' ')[1];
          const decoded: any = jwt.verify(token, JWT_SECRET);
          if (decoded?.donorId) {
            body.donorId = decoded.donorId;
            delete body.guestName;
            delete body.guestEmail;
          }
        } catch {}
      }

      // Validate request body
      const validatedData = createMonetaryDonationSchema.parse(body);

      // Create donation
      const donation = await donationService.createMonetaryDonation(
        validatedData.donorId,
        validatedData.amount,
        validatedData.paymentMethod,
        validatedData.paymentReference,
        validatedData.guestName,
        validatedData.guestEmail,
        (validatedData as any).guestMobileNumber
      );

      res.status(201).json({
        success: true,
        message: 'Monetary donation created successfully',
        data: {
          donation,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleValidationError(error, res);
      } else {
        handleServiceError(error, res);
      }
    }
  }

  /**
   * Initialize Maya Checkout and return checkoutId + redirectUrl
   * POST /api/donations/maya/checkout
   */
  async initMayaCheckout(req: Request, res: Response): Promise<void> {
    try {
      let { donorId, amount, description, email, phone } = req.body || {};
      const numericAmount = Number(amount);
      if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        res.status(400).json({ success: false, message: 'Positive amount is required' });
        return;
      }

      // If donorId missing, try to derive from Authorization bearer token
      if (!donorId && req.headers.authorization) {
        try {
          const token = (req.headers.authorization || '').split(' ')[1];
          const decoded: any = jwt.verify(token, JWT_SECRET);
          if (decoded?.donorId) donorId = decoded.donorId;
          if (!email && decoded?.userId) {
            const u = await prisma.user.findUnique({ where: { id: decoded.userId } });
            if (u?.email) email = u.email;
          }
        } catch {}
      }

      // Optional: ensure donor exists only when donorId is provided
      if (donorId) {
        const donor = await prisma.donor.findUnique({ where: { id: donorId } });
        if (!donor) {
          res.status(404).json({ success: false, message: 'Donor not found' });
          return;
        }
      }

      const pg = new PaymentGatewayService();
      const created = await pg.createMayaCheckout(numericAmount, description || 'Food Donation', { email, phone });
      if (!created.success) {
        res.status(502).json({ success: false, message: created.failureReason || 'Failed to create Maya checkout' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Maya checkout initialized',
        data: {
          donorId,
          amount: numericAmount,
          checkoutId: created.checkoutId,
          redirectUrl: created.redirectUrl,
        },
      });
    } catch (error) {
      handleServiceError(error, res);
    }
  }

  /**
   * Initialize PayPal Checkout and return redirectUrl
   * POST /api/donations/paypal/checkout
   */
  async initPayPalCheckout(req: Request, res: Response): Promise<void> {
    try {
      let { donorId, amount, description, email, phone } = req.body || {};
      const numericAmount = Number(amount);
      if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        res.status(400).json({ success: false, message: 'Positive amount is required' });
        return;
      }

      // If donorId missing, try to derive from Authorization bearer token
      if (!donorId && req.headers.authorization) {
        try {
          const token = (req.headers.authorization || '').split(' ')[1];
          const decoded: any = jwt.verify(token, JWT_SECRET);
          if (decoded?.donorId) donorId = decoded.donorId;
          if (!email && decoded?.userId) {
            const u = await prisma.user.findUnique({ where: { id: decoded.userId } });
            if (u?.email) email = u.email;
          }
        } catch {}
      }

      // Optional: ensure donor exists only when donorId is provided
      if (donorId) {
        const donor = await prisma.donor.findUnique({ where: { id: donorId } });
        if (!donor) {
          res.status(404).json({ success: false, message: 'Donor not found' });
          return;
        }
      }

      const pg = new PaymentGatewayService();
      const created = await pg.createPayPalOrder(numericAmount, description || 'Food Donation', email);
      
      if (!created.success) {
        res.status(502).json({ success: false, message: created.failureReason || 'Failed to create PayPal order' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'PayPal checkout initialized',
        data: {
          donorId,
          amount: numericAmount,
          orderId: created.orderId,
          redirectUrl: created.redirectUrl,
        },
      });
    } catch (error) {
      handleServiceError(error, res);
    }
  }

  /**
   * Create a produce donation
   * POST /api/donations/produce
   */
  async createProduceDonation(req: Request, res: Response): Promise<void> {
    try {
      // Parse and validate request body
      const { donorId, donationCenterId, scheduledDate, items, guestName, guestEmail } = req.body;
      
      // Parse items if it's a string (from FormData)
      let parsedItems = items;
      if (typeof items === 'string') {
        try {
          parsedItems = JSON.parse(items);
        } catch (e) {
          res.status(400).json({
            success: false,
            message: 'Invalid items format. Expected JSON array.',
          });
          return;
        }
      }

      // Ensure parsedItems is an array to avoid runtime errors further down
      if (!Array.isArray(parsedItems)) {
        res.status(400).json({ success: false, message: 'Invalid items: expected an array of item objects' });
        return;
      }

      // Debug: log incoming parsed values to help diagnose validation failures in tests
      try {
        console.debug('[CreateProduceDonation] raw body keys:', Object.keys(req.body || {}));
        console.debug('[CreateProduceDonation] donationCenterId:', donationCenterId);
        console.debug('[CreateProduceDonation] scheduledDate:', scheduledDate);
        console.debug('[CreateProduceDonation] items (raw):', typeof items === 'string' ? items : JSON.stringify(items));
      } catch (e) {}

      // If donorId is not provided, try to derive it from Authorization bearer token
      let derivedDonorId = donorId;
      if (!derivedDonorId && req.headers.authorization) {
        try {
          const token = (req.headers.authorization || '').split(' ')[1];
          const decoded: any = jwt.verify(token, JWT_SECRET);
          if (decoded?.donorId) derivedDonorId = decoded.donorId;
          // If token contains only userId, let the service handle lookup by userId
          if (!derivedDonorId && decoded?.userId) derivedDonorId = decoded.userId;
        } catch (e) {
          // ignore token parsing errors; validation will handle missing donor info
        }
      }

      // Validate the data
      const validatedData = createProduceDonationSchema.parse({
        donorId: derivedDonorId,
        donationCenterId,
        scheduledDate,
        items: parsedItems,
        guestName,
        guestEmail,
      });

      // Pass uploaded files and optional fileIndexMap to service for explicit mapping
      const uploadedFiles = req.files ? (req.files as Express.Multer.File[]) : undefined;
      let fileIndexMap: number[] | undefined = undefined;
      if (req.body && req.body.fileIndexMap) {
        try {
          fileIndexMap = typeof req.body.fileIndexMap === 'string'
            ? JSON.parse(req.body.fileIndexMap)
            : req.body.fileIndexMap;
        } catch (e) {
          // ignore parse errors; validation will handle mismatches later
        }
      }
      let fileMeta: any = undefined;
      if (req.body && req.body.fileMeta) {
        try {
          fileMeta = typeof req.body.fileMeta === 'string' ? JSON.parse(req.body.fileMeta) : req.body.fileMeta;
        } catch (e) {
          // ignore parse errors
        }
      }

      // Create donation (service will map files to items using fileIndexMap when provided)
      const donation = await donationService.createProduceDonation(
        validatedData.donorId,
        validatedData.donationCenterId,
        new Date(validatedData.scheduledDate),
        validatedData.items,
        uploadedFiles,
        fileIndexMap,
        fileMeta,
        validatedData.guestName,
        validatedData.guestEmail
      );

      res.status(201).json({
        success: true,
        message: 'Produce donation scheduled successfully',
        data: {
          donation,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleValidationError(error, res);
      } else {
        handleServiceError(error, res);
      }
    }
  }

  /**
   * Scan a donation QR code to confirm drop-off
   * POST /api/donations/scan-qr
   */
  async scanDonationQr(req: Request, res: Response): Promise<void> {
    try {
      const { qrData } = scanDonationQrSchema.parse(req.body);

      const donation = await donationService.scanDonationQr(qrData);

      res.status(200).json({
        success: true,
        message: 'Donation found',
        data: { donation },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleValidationError(error, res);
      } else {
        handleServiceError(error, res);
      }
    }
  }

  /**
   * Get donation by ID
   * GET /api/donations/:id
   */
  async getDonationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Donation ID is required',
        });
        return;
      }

      const donation = await donationService.getDonationById(id);

      if (!donation) {
        res.status(404).json({
          success: false,
          message: 'Donation not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          donation,
        },
      });
    } catch (error) {
      handleServiceError(error, res);
    }
  }

  /**
   * Get donations with filters
   * GET /api/donations
   */
  async getDonations(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery = getDonationsQuerySchema.parse(req.query);

      // Convert date strings to Date objects if provided
      const filters: any = {
        donorId: validatedQuery.donorId,
        status: validatedQuery.status,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
      };

      if (validatedQuery.fromDate) {
        filters.fromDate = new Date(validatedQuery.fromDate);
      }

      if (validatedQuery.toDate) {
        filters.toDate = new Date(validatedQuery.toDate);
      }

      const { donations, total } = await donationService.getDonations(filters);

      res.status(200).json({
        success: true,
        data: {
          donations,
          pagination: {
            total,
            limit: validatedQuery.limit,
            offset: validatedQuery.offset,
            hasMore: validatedQuery.offset + donations.length < total,
          },
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleValidationError(error, res);
      } else {
        handleServiceError(error, res);
      }
    }
  }

  /**
   * Update donation status (admin operation)
   * PATCH /api/donations/:id/status
   */
  async updateDonationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body || {};

      // Validate request
      const validatedData = updateDonationStatusSchema.parse({
        donationId: id,
        status,
        notes,
      });

      const donation = await donationService.updateDonationStatus(
        validatedData.donationId,
        validatedData.status,
        validatedData.notes
      );

      res.status(200).json({
        success: true,
        message: 'Donation status updated successfully',
        data: {
          donation,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleValidationError(error, res);
      } else {
        handleServiceError(error, res);
      }
    }
  }
}