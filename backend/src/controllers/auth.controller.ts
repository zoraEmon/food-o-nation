import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // or bcryptjs depending on what you installed
import { PrismaClient } from '@prisma/client';
import { loginSchema, registerBeneficiarySchema, registerDonorSchema } from '../utils/validators.js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'foodONationSecret';

// For Beneficiary Registration
export const registerBeneficiary = async (req: Request, res: Response) => {
    try {
        const result = registerBeneficiarySchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.format() });
        }

        const data = result.data;

        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                status: 'PENDING',
                
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
        console.error("Register Beneficiary Error:", error);
        res.status(500).json({ message: 'Failed to register, internal server error.' });
    }

}

// For Donor Registration
export const registerDonor = async (req: Request, res: Response) => {
    try {
        const result = registerDonorSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.format() });
        }

        const data = result.data;

        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use." });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                status: 'PENDING',
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
        console.error("Register Donor Error:", error);
        res.status(500).json({ message: 'Failed to register, internal server error.' });
    }
}

//For login i-nupdate ko to handle multiple roles dynamically
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

        // Users can have multiple roles 
        const roles: string[] = [];
        let displayName = user.email; // Fallback

        if (user.adminProfile) {
            roles.push('ADMIN');
            displayName = `${user.adminProfile.firstName} ${user.adminProfile.lastName}`;
        }
        if (user.donorProfile) {
            roles.push('DONOR');
            // If they are only a donor (not admin), use donor name
            if(roles.length === 1) displayName = user.donorProfile.displayName;
        }
        if (user.beneficiaryProfile) {
            roles.push('BENEFICIARY');
             // If they are only a beneficiary, use real name
            if(roles.length === 1) displayName = `${user.beneficiaryProfile.firstName} ${user.beneficiaryProfile.lastName}`;
        }

        // --- GENERATE TOKEN ---
        // We embed the array of roles into the token
        const token = jwt.sign(
            { 
                userId: user.id, 
                status: user.status, 
                roles: roles // now, imbedded na sa tokens yun roles ng user ['BENEFICIARY', 'DONOR'], etc.
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
                roles: roles // Send this to frontend so it knows which dashboard to show
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Login failed, internal server error.' });
    }
}