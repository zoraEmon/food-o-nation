import { email, string, z } from 'zod';
import { Gender, CivilStatus, DonorType, DonationStatus, HouseholdPosition, DonationItemStatus } from "../../generated/prisma/index.js";

// Password policy: at least 12 chars (min enforced separately), must include
// - at least one uppercase letter
// - at least one digit
// - at least one special character
const PASSWORD_REGEX = /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/\?]).+/; // eslint-disable-line no-useless-escape


// Common Login Schema

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(12, 'Password is too short - required at least 12 characters')
      .regex(PASSWORD_REGEX, { message: 'Password must include at least one uppercase letter, one number, and one special character' }),

    // I have updated this part para flexible ang login depende sa login form na su-submit.
    loginType: z.enum(['BENEFICIARY', 'DONOR', 'ADMIN'], {
      error: () => ({ message: "Login type is required (ADMIN, BENEFICIARY, or DONOR)" })
    }),

});

export const registerBeneficiarySchema = z.object({
    // Account Info
    email: z.string().email(),
    password: z.string().min(12, 'Password is too short - required at least 12 characters')
      .regex(PASSWORD_REGEX, { message: 'Password must include at least one uppercase letter, one number, and one special character' }),

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
    householdPosition: z.nativeEnum(HouseholdPosition),
    primaryPhone: z.string().min(11, 'Primary phone is required'),

    // Additional fields submitted via FormData
    householdPositionDetail: z.string().optional(),
    governmentIdType: z.string().optional(),

    // Counts
    childrenCount: z.coerce.number().int().min(0).optional(),
    adultCount: z.coerce.number().int().min(0).optional(),
    seniorCount: z.coerce.number().int().min(0).optional(),
    pwdCount: z.coerce.number().int().min(0).optional(),

    // Special diet
    specialDietRequired: z.preprocess((v) => {
      if (typeof v === 'string') return v === 'true';
      return v;
    }, z.boolean()).optional(),
    specialDietDescription: z.string().optional(),

    // Economic
    monthlyIncome: z.coerce.number().min(0).optional(),
    incomeSources: z.preprocess((v) => {
      if (typeof v === 'string') {
        try { return JSON.parse(v); } catch { return undefined; }
      }
      return v;
    }, z.array(z.string()).optional()),
    mainEmploymentStatus: z.string().optional(),
    receivingAid: z.preprocess((v) => {
      if (typeof v === 'string') return v === 'true';
      return v;
    }, z.boolean()).optional(),
    receivingAidDetail: z.string().optional(),

    // Consents and signature handled by controller
    declarationAccepted: z.preprocess((v) => {
      if (typeof v === 'string') return v === 'true';
      return v;
    }, z.boolean()).optional(),
    privacyAccepted: z.preprocess((v) => {
      if (typeof v === 'string') return v === 'true';
      return v;
    }, z.boolean()).optional(),

    // Household members (sent as JSON string in FormData)
    householdMembers: z.preprocess((v) => {
      if (typeof v === 'string') {
        try { return JSON.parse(v); } catch { return undefined; }
      }
      return v;
    }, z.array(z.object({
      fullName: z.string().min(1),
      birthDate: z.string().datetime(),
      age: z.coerce.number().int(),
      relationship: z.string().min(1)
    })).optional()),

    // Survey answers (sent as JSON string in FormData)
    surveyAnswers: z.preprocess((v) => {
      if (typeof v === 'string') {
        try { return JSON.parse(v); } catch { return undefined; }
      }
      return v;
    }, z.array(z.object({
      questionId: z.string().min(1),
      response: z.string().min(1)
    })).optional()),

    // Address Info
    streetNumber: z.string().min(1, 'Street number is required'),
    barangay: z.string().min(1, 'Barangay is required'),
    province: z.string().optional(),
    municipality: z.string().min(1, 'Municipality is required'),
    region: z.string().optional(),
    zipCode: z.string().regex(/^\d{4}$/, 'Zip code must be 4 digits').optional(),
});

//Para sa donor registration.
export const registerDonorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, 'Password is too short - required at least 12 characters')
    .regex(PASSWORD_REGEX, { message: 'Password must include at least one uppercase letter, one number, and one special character' }), // Synchronized with loginSchema
  
  displayName: z.string().min(2, 'Display name is required (min 2 characters)'),
  donorType: z.nativeEnum(DonorType),
  primaryPhone: z.string().optional().refine((v) => {
    if (!v) return true;
    return /^(09\d{9}|\+63\d{10})$/.test(v);
  }, { message: 'Primary phone must be local (09XXXXXXXXX) or international (+63XXXXXXXXXX)' }),
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
  imageUrl: z.string().url('Invalid image URL').optional(),
  status: z.nativeEnum(DonationItemStatus).optional(),
});

/**
 * Schema for monetary donation creation
 */
export const createMonetaryDonationSchema = z.object({
  donorId: z.string().uuid('Invalid donor ID format').optional(),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .min(1, 'Minimum donation amount is ₱1')
    .max(1000000, 'Maximum donation amount is ₱1,000,000'),
  paymentMethod: z.string().trim().transform((val, ctx) => {
    const allowed = ['PayPal', 'Stripe', 'Mastercard', 'Visa', 'Credit Card', 'Debit Card', 'Maya', 'Bank Transfer'];
    const match = allowed.find(method => method.toLowerCase() === val.toLowerCase());
    if (!match) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid payment method' });
      return z.NEVER;
    }
    return match;
  }),
  paymentReference: z.string()
    .min(5, 'Payment reference must be at least 5 characters')
    .max(100, 'Payment reference is too long'),
  guestName: z.string().min(2, 'Guest name must be at least 2 characters').optional(),
  guestEmail: z.string().email('Invalid guest email').optional(),
  guestMobileNumber: z.string().min(7, 'Mobile number is too short').optional(),
});

/**
 * Schema for produce donation creation
 */
export const createProduceDonationSchema = z.object({
  donorId: z.string().uuid('Invalid donor ID format').optional(),
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
  guestName: z.string().min(2, 'Guest name must be at least 2 characters').optional(),
  guestEmail: z.string().email('Invalid guest email').optional(),
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

/**
 * Schema for scanning donation QR codes
 */
export const scanDonationQrSchema = z.object({
  qrData: z.string().min(1, 'qrData is required'),
});
