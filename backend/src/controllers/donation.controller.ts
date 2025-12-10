import { Request, Response } from 'express';
import { DonationService } from '../services/donation.service.js';
import {
  createMonetaryDonationSchema,
  createProduceDonationSchema,
  updateDonationStatusSchema,
  getDonationsQuerySchema,
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
        validatedData.paymentReference
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
   * Create a produce donation
   * POST /api/donations/produce
   */
  async createProduceDonation(req: Request, res: Response): Promise<void> {
    try {
      // Parse and validate request body
      const { donorId, donationCenterId, scheduledDate, items } = req.body;
      
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
        imageUrls
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