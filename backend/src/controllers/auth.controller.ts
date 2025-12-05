import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { loginSchema, registerBeneficiarySchema, registerDonorSchema } from '../utils/validators.js';
import dotenv from 'dotenv';
import fs from 'fs'; 

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'foodONationSecret';

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

        // 5. Create User & Beneficiary Profile
        const newUser = await prisma.user.create({
            data: {
                // User Fields
                email: data.email,
                password: hashedPassword,
                status: 'PENDING',
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
                        
                        address: {
                            create: {
                                streetNumber: data.streetNumber,
                                barangay: data.barangay,
                                municipality: data.municipality,
                                region: data.region,
                                zipCode: data.zipCode,
                                country: 'Philippines'
                            }
                        }
                    }
                }
            },
            include: {
                beneficiaryProfile: true
            }
        });

        res.status(201).json({ 
            message: "Beneficiary application submitted", 
            userId: newUser.id 
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

        // 4. Create User
        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                status: 'PENDING',
                
                // ✅ Save Image
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

        res.status(201).json({
            message: "Donor application submitted",
            userId: newUser.id,
        })

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

// ... existing imports
// Add this new export at the bottom

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
