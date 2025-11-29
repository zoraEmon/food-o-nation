import { email, string, z } from 'zod';
import { Gender, CivilStatus, DonorType} from "@prisma/client";

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

    // Personal Info
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional(),
    gender: z.nativeEnum(Gender),
    civilStatus: z.nativeEnum(CivilStatus),
    birthDate: z.string().datetime(),
    age: z.number().int(),
    contactNumber: z.string().min(11, 'Contact number is required'),
    occupation: z.string().min(1, 'Occupation is required'),
    householdNumber: z.number().int().min(1, 'Household number must be at least 1'),
    householdAnnualSalary: z.number().min(0, 'Household annual income must be at least 0'),

    // Address Info
    streetNumber: z.string(),
    barangay: z.string(),
    municipality: z.string(),
    region: z.string(),
    zipCode: z.string(),
});

//Para sa donor registration.
export const registerDonorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  
  displayName: z.string().min(2),
  donorType: z.nativeEnum(DonorType),
});