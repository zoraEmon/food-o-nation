import { email, string, z } from 'zod';
import { Gender, CivilStatus, DonorType} from "@prisma/client";

// Common Login Schema

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(12, 'Password is too short - required at least 12 characters'),
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
    CivilStatus: z.nativeEnum(CivilStatus),
    householdNumber: z.number().int().min(1, 'Household number must be at least 1'),
    householdAnnualIncome: z.number().min(0, 'Household annual income must be at least 0'),

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