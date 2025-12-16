import { Request, Response } from 'express';
import { DonationService } from '../services/donation.service.js';
import { PaymentGatewayService } from '../services/paymentGateway.service.js';
import {
  createMonetaryDonationSchema,
  createProduceDonationSchema,
  updateDonationStatusSchema,
  getDonationsQuerySchema,
  scanDonationQrSchema,
} from '../utils/validators.js';
import { ZodError } from 'zod';

const donationService = new DonationService();

/**
 * Helper function to handle validation errors
 */
function handleValidationError(error: ZodError | any, res: Response): void {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors = (error.errors || []).map(err => ({
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
  
  const statusCode = error.message?.includes('not found') ? 404 : 500;
  
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
      // Validate request body
      const validatedData = createMonetaryDonationSchema.parse(req.body);

      // Create donation
      const donation = await donationService.createMonetaryDonation(
        validatedData.donorId,
        validatedData.amount,
        validatedData.paymentMethod,
        validatedData.paymentReference,
        validatedData.guestName,
        validatedData.guestEmail
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
      const { donorId, amount, description } = req.body || {};
      const numericAmount = Number(amount);
      if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        res.status(400).json({ success: false, message: 'Positive amount is required' });
        return;
      }

      // Optional: ensure donor exists only when donorId is provided
      if (donorId) {
        const service = new DonationService();
        const donor = await (service as any).prisma?.donor?.findUnique?.({ where: { id: donorId } }).catch(() => null);
        if (!donor) {
          res.status(404).json({ success: false, message: 'Donor not found' });
          return;
        }
      }

      const pg = new PaymentGatewayService();
      const created = await pg.createMayaCheckout(numericAmount, description || 'Food Donation');
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
      const { donorId, amount, description } = req.body || {};
      const numericAmount = Number(amount);
      if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        res.status(400).json({ success: false, message: 'Positive amount is required' });
        return;
      }

      // Optional: ensure donor exists only when donorId is provided
      if (donorId) {
        const service = new DonationService();
        const donor = await (service as any).prisma?.donor?.findUnique?.({ where: { id: donorId } }).catch(() => null);
        if (!donor) {
          res.status(404).json({ success: false, message: 'Donor not found' });
          return;
        }
      }

      const pg = new PaymentGatewayService();
      const appBase = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
      
      // Generate a reference for tracking
      const reference = `PAYPAL-${Date.now()}`;
      
      // For sandbox testing, use a mock redirect URL or use PayPal's test mode
      // In production, call PayPal Orders API to create an order first
      const redirectUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${reference}`;

      res.status(200).json({
        success: true,
        message: 'PayPal checkout initialized',
        data: {
          donorId,
          amount: numericAmount,
          paymentReference: reference,
          redirectUrl,
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

      // Validate the data
      const validatedData = createProduceDonationSchema.parse({
        donorId,
        donationCenterId,
        scheduledDate,
        items: parsedItems,
        guestName,
        guestEmail,
      });

      // Extract image URLs from uploaded files
      const imageUrls = req.files
        ? (req.files as Express.Multer.File[]).map(file => file.path)
        : [];

      // Create donation
      const donation = await donationService.createProduceDonation(
        validatedData.donorId,
        validatedData.donationCenterId,
        new Date(validatedData.scheduledDate),
        validatedData.items,
        imageUrls,
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
        message: 'Donation scanned successfully',
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