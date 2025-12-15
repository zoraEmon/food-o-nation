import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';
import { loginSchema, registerBeneficiarySchema, registerDonorSchema } from '../utils/validators.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { EmailService } from '../services/email.service.js';

dotenv.config();

const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();
const emailService = new EmailService();
const JWT_SECRET = process.env.JWT_SECRET || 'foodONationSecret';

// Helper to generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Helper to hash OTP (similar to password hashing)
const hashOTP = async (otp: string) => {
    return bcrypt.hash(otp, 10); // Use 10 rounds for salting
};

// Helper to compare OTP
const compareOTP = async (otp: string, hashedOtp: string) => {
    return bcrypt.compare(otp, hashedOtp);
};

// ✅ 1. Define custom request type to make TypeScript happy
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

// ✅ 2. Use 'MulterRequest' here instead of 'Request'
export const registerBeneficiary = async (req: MulterRequest, res: Response) => {
    try {
        // 1. Handle Profile Image Path
        let profileImagePath = null;
        
        if (req.file) {
            profileImagePath = req.file.path.replace(/\\/g, "/");
        }

        // 2. Validate Text Data
        const result = registerBeneficiarySchema.safeParse(req.body);
        
        if (!result.success) {
            // Cleanup: Delete uploaded file if validation fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ errors: result.error.format() });
        }

        const data = result.data;

        // 3. Check for Existing Email
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            if (req.file) fs.unlinkSync(req.file.path); // Cleanup
            return res.status(400).json({ message: 'Email already in use' });
        }

        // 4. Hash Password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 5. Generate OTP and Set Expiry
        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        // 6. Create User & Beneficiary Profile
        const newUser = await prisma.user.create({
            data: {
                // User Fields
                email: data.email,
                password: hashedPassword,
                status: 'PENDING',
                isVerified: false, // User is not verified until OTP is entered
                otpCode: hashedOtp,
                otpExpiresAt: otpExpiresAt,
                profileImage: profileImagePath, // ✅ Image saved to User table
                
                // Beneficiary Profile
                beneficiaryProfile: {
                    create: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        middleName: data.middleName,
                        gender: data.gender,
                        civilStatus: data.civilStatus,
                        occupation: data.occupation,
                        
                        age: data.age,
                        birthDate: new Date(data.birthDate),
                        contactNumber: data.contactNumber,
                        householdNumber: data.householdNumber,
                        householdAnnualSalary: data.householdAnnualSalary,
                        
                        // Application details
                        householdPosition: data.householdPosition,
                        householdPositionDetail: data.householdPositionDetail,
                        primaryPhone: data.primaryPhone,
                        activeEmail: data.activeEmail,
                        governmentIdType: data.governmentIdType,
                        governmentIdFileUrl: data.governmentIdFileUrl,
                        
                        // Household composition
                        childrenCount: data.childrenCount,
                        adultCount: data.adultCount,
                        seniorCount: data.seniorCount,
                        pwdCount: data.pwdCount,
                        
                        // Health/Diet
                        specialDietRequired: data.specialDietRequired,
                        specialDietDescription: data.specialDietDescription,
                        
                        // Economic
                        monthlyIncome: data.monthlyIncome,
                        incomeSources: data.incomeSources,
                        mainEmploymentStatus: data.mainEmploymentStatus,
                        receivingAid: data.receivingAid,
                        receivingAidDetail: data.receivingAidDetail,
                        
                        // Consent
                        declarationAccepted: data.declarationAccepted,
                        privacyAccepted: data.privacyAccepted,
                        signatureUrl: data.signatureUrl,
                        
                        address: {
                            create: {
                                streetNumber: data.address.streetNumber,
                                barangay: data.address.barangay,
                                municipality: data.address.municipality,
                                region: data.address.region || '', // Provide a default empty string if undefined
                                zipCode: data.address.zipCode || '', // Provide a default empty string if undefined
                                country: data.address.country || 'Philippines'
                            }
                        },
                        
                        // Household members
                        householdMembers: data.householdMembers ? {
                            create: data.householdMembers.map(member => ({
                                fullName: member.fullName,
                                birthDate: new Date(member.birthDate),
                                age: member.age,
                                relationship: member.relationship
                            }))
                        } : undefined
                    }
                }
            },
            include: {
                beneficiaryProfile: true
            }
        });

        // 7. Send OTP Email
        await emailService.sendOTP(newUser.email, otp);

        res.status(201).json({ 
            message: "Registration successful! Please check your email (or phone) for your verification code to log in.", 
            userId: newUser.id,
            requireVerification: true // Indicate to frontend that OTP is required
        });

    } catch (error) {
        // Cleanup on server error
        if (req.file) {
            fs.unlinkSync(req.file.path); 
        }
        console.error("Register Beneficiary Error:", error);
        res.status(500).json({ message: 'Failed to register, internal server error.' });
    }
}

// --- REGISTER DONOR (Unchanged, but kept for context) ---
export const registerDonor = async (req: MulterRequest, res: Response) => { // Use MulterRequest
    try {
        // 1. Handle Image
        let profileImagePath = null;
        if (req.file) {
            profileImagePath = req.file.path.replace(/\\/g, "/");
        }

        // 2. Validate
        const result = registerDonorSchema.safeParse(req.body);
        if (!result.success) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ errors: result.error.format() });
        }

        const data = result.data;

        // 3. Check Email
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Email already in use." });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 4. Generate OTP and Set Expiry
        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        // 5. Create User
        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                status: "PENDING",
                isVerified: false, // User is not verified until OTP is entered
                otpCode: hashedOtp,
                otpExpiresAt: otpExpiresAt,
                profileImage: profileImagePath,

                donorProfile: {
                    create: {
                        displayName: data.displayName,
                        donorType: data.donorType,
                        totalDonation: 0,
                    }
                }
            }
        });

        // 6. Send OTP Email
        await emailService.sendOTP(newUser.email, otp);

        res.status(201).json({
            message: "Registration successful! Please check your email (or phone) for your verification code to log in.",
            userId: newUser.id,
            requireVerification: true // Indicate to frontend that OTP is required
        });

    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error("Register Donor Error:", error);
        res.status(500).json({ message: 'Failed to register, internal server error.' });
    }
}

// --- LOGIN (Unchanged) ---
export const login = async (req: Request, res: Response) => {
    try {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.format() });
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({ 
            where: { email }, 
            include: {
                beneficiaryProfile: true,
                donorProfile: true,
                adminProfile: true,
            }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.status === 'DEACTIVATED' || user.status === 'REJECTED') {
            return res.status(403).json({ message: 'Account is not active. Please contact support.' });
        }

        const roles: string[] = [];
        let displayName = user.email;

        if (user.adminProfile) {
            roles.push('ADMIN');
            displayName = `${user.adminProfile.firstName} ${user.adminProfile.lastName}`;
        }
        if (user.donorProfile) {
            roles.push('DONOR');
            if(roles.length === 1) displayName = user.donorProfile.displayName;
        }
        if (user.beneficiaryProfile) {
            roles.push('BENEFICIARY');
            if(roles.length === 1) displayName = `${user.beneficiaryProfile.firstName} ${user.beneficiaryProfile.lastName}`;
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                status: user.status, 
                roles: roles 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                displayName,
                status: user.status,
                roles: roles
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Login failed, internal server error.' });
    }
}

// ✅ NEW: Get Current User Profile (Full Data)
export const getMe = async (req: any, res: Response) => {
    try {
        // The middleware attaches 'user' to req
        const userId = req.user?.userId; 

        if (!userId) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            // Use 'select' to strictly control what we send back
            select: {
                id: true,
                email: true,
                status: true,
                profileImage: true, // Send the image path
                createdAt: true,
                // Notice: 'password' is NOT selected here!
                
                // Include the profiles
                beneficiaryProfile: {
                    include: {
                        address: true // Include address details
                    }
                },
                donorProfile: true,
                adminProfile: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);

    } catch (error) {
        console.error("GetMe Error:", error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

export const verifyOTP = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required." });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Account already verified." });
        }

        if (!user.otpCode || !user.otpExpiresAt) {
            return res.status(400).json({ message: "No OTP found for this account. Please register again." });
        }

        const isOtpValid = await compareOTP(otp, user.otpCode);
        const isOtpExpired = user.otpExpiresAt < new Date();

        if (!isOtpValid || isOtpExpired) {
            // Clear OTP fields to prevent brute-forcing or re-use of expired OTP
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    otpCode: null,
                    otpExpiresAt: null,
                },
            });
            return res.status(400).json({ message: isOtpExpired ? "OTP expired." : "Incorrect OTP." });
        }

        // OTP is valid and not expired, verify the user
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                // status: "APPROVED", // COMMENTED OUT: Admin will approve status
                otpCode: null,       // Clear OTP after successful verification
                otpExpiresAt: null,
            },
            include: {
                beneficiaryProfile: true,
                donorProfile: true,
                adminProfile: true,
            },
        });

        const roles: string[] = [];
        let displayName = updatedUser.email;

        if (updatedUser.adminProfile) {
            roles.push("ADMIN");
            displayName = `${updatedUser.adminProfile.firstName} ${updatedUser.adminProfile.lastName}`;
        }
        if (updatedUser.donorProfile) {
            roles.push("DONOR");
            if(roles.length === 1) displayName = updatedUser.donorProfile.displayName;
        }
        if (updatedUser.beneficiaryProfile) {
            roles.push("BENEFICIARY");
            if(roles.length === 1) displayName = `${updatedUser.beneficiaryProfile.firstName} ${updatedUser.beneficiaryProfile.lastName}`;
        }

        const token = jwt.sign(
            { 
                userId: updatedUser.id, 
                status: updatedUser.status, 
                roles: roles 
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Account verified successfully!",
            token,
            user: {
                id: updatedUser.id,
                displayName,
                status: updatedUser.status,
                roles: roles,
                isVerified: updatedUser.isVerified
            },
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: "Failed to verify OTP, internal server error." });
    }
};
