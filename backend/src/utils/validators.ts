import { email, string, z } from 'zod';
import { Gender, CivilStatus, DonorType, DonationStatus} from "@prisma/client";

// Common Login Schema

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(12, 'Password is too short - required at least 12 characters'),

    // I have updated this part para flexible ang login depende sa login form na su-submit.
    loginType: z.enum(['BENEFICIARY', 'DONOR', 'ADMIN'], {
      error: () => ({ message: "Login type is required (ADMIN, BENEFICIARY, or DONOR)" })
    }),

});

export const registerBeneficiarySchema = z.object({
    // Account Info
    email: z.string().email(),
    password: z.string().min(12, 'Password is too short - required at least 12 characters'),

    // profileImage: z.string().optional(),

    // Personal Info
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional(),
    gender: z.nativeEnum(Gender),
    civilStatus: z.nativeEnum(CivilStatus),
    birthDate: z.string().datetime(),
    age: z.coerce.number().int(),
    contactNumber: z.string().min(11, 'Contact number is required'),
    occupation: z.string().min(1, 'Occupation is required'),
    householdNumber: z.coerce.number().int().min(1, 'Household number must be at least 1'),
    householdAnnualSalary: z.coerce.number().min(0, 'Household annual income must be at least 0'),

    // Address Info
    streetNumber: z.string().min(1, 'Street number is required'),
    barangay: z.string().min(1, 'Barangay is required'),
    municipality: z.string().min(1, 'Municipality is required'),
    region: z.string().optional(),
    zipCode: z.string().optional(),
});

//Para sa donor registration.
export const registerDonorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, 'Password is too short - required at least 12 characters'), // Synchronized with loginSchema
  
  displayName: z.string().min(2, 'Display name is required (min 2 characters)'),
  donorType: z.nativeEnum(DonorType),
});

// ============================================
// DONATION VALIDATION SCHEMAS
// ============================================

/**
 * Schema for validating individual donation items
 */
export const donationItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Item category is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required (e.g., kg, pcs, liters)'),
});

/**
 * Schema for monetary donation creation
 */
export const createMonetaryDonationSchema = z.object({
  donorId: z.string().uuid('Invalid donor ID format'),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .min(1, 'Minimum donation amount is ₱1')
    .max(1000000, 'Maximum donation amount is ₱1,000,000'),
  paymentMethod: z.enum(['PayPal', 'Stripe', 'Mastercard', 'Visa', 'Credit Card', 'Debit Card', 'GCash', 'Bank Transfer'], {
    error: () => ({ message: 'Invalid payment method' })
  }),
  paymentReference: z.string()
    .min(5, 'Payment reference must be at least 5 characters')
    .max(100, 'Payment reference is too long'),
});

/**
 * Schema for produce donation creation
 */
export const createProduceDonationSchema = z.object({
  donorId: z.string().uuid('Invalid donor ID format'),
  donationCenterId: z.string().uuid('Invalid donation center ID format'),
  scheduledDate: z.string()
    .datetime('Invalid date format, expected ISO 8601')
    .refine((date) => {
      const scheduledDate = new Date(date);
      const now = new Date();
      const maxFutureDate = new Date();
      maxFutureDate.setMonth(maxFutureDate.getMonth() + 6); // Max 6 months in future
      
      return scheduledDate > now && scheduledDate <= maxFutureDate;
    }, {
      message: 'Scheduled date must be in the future but not more than 6 months ahead'
    }),
  items: z.array(donationItemSchema)
    .min(1, 'At least one donation item is required')
    .max(50, 'Maximum 50 items per donation'),
  // imageUrls will be handled by multer middleware
});

/**
 * Schema for updating donation status (admin operation)
 */
export const updateDonationStatusSchema = z.object({
  donationId: z.string().uuid('Invalid donation ID format'),
  status: z.nativeEnum(DonationStatus, {
    error: () => ({ message: 'Invalid donation status' })
  }),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

/**
 * Schema for querying donations with filters
 */
export const getDonationsQuerySchema = z.object({
  donorId: z.string().uuid('Invalid donor ID').optional(),
  status: z.nativeEnum(DonationStatus).optional(),
  fromDate: z.string().datetime('Invalid from date format').optional(),
  toDate: z.string().datetime('Invalid to date format').optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
