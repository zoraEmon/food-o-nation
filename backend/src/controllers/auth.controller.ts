import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { loginSchema, registerBeneficiarySchema, registerDonorSchema} from '../utils/validators.js';
import dotenv from 'dotenv';
import { email } from 'zod';
dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'foodONationSecret';

// Beneficiary Registration
export const registerBeneficiary = async (req: Request, res: Response) => {
    try {
       
        const result = registerBeneficiarySchema.safeParse(req.body);
        if(!result.success) {
            return res.status(400).json({ errors: result.error.format });
        }

        const data = result.data;
        
        // Check if user with the same email already exist.
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hinash ang password bago i-save sa database
        const hashedPassword = await bcrypt.hash(data.password, 10);
       
        // Create User + Beneficiary Profile + Address in ONE transaction
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

        // Return success response para ma notify ang user na successful ang registration
        res.status(201).json({ 
            message: "Beneficiary application submitted", 
            userId: newUser.id 
        });

    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to register, internal server error.' });
    }
}

 export const registerDonor = async (req: Request, res: Response) => {
        try {
            const result = registerDonorSchema.safeParse(req.body);
            if(!result.success) {
                return res.status(400).json({ errors: result.error.format });
            }

            const data = result.data;

            const existingUser = await prisma.user.findUnique({ where: {email: data.email}})

            if(existingUser) {
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
            console.error(error);
            res.status(500).json({ message: 'Failed to register, internal server error.' });
        }
}

export const login = async (req: Request, res: Response) => {
    try {
        const result = loginSchema.safeParse(req.body);
        if(!result.success) {
            return res.status(400).json({ errors: result.error.format });
        }

        const { email, password} = result.data;

        const user = await prisma.user.findUnique({ 
            where: {email}, 
            include: {
                beneficiaryProfile: true,
                donorProfile: true,
                adminProfile: true,
            }
        });

        if(!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if(user.status ==='DEACTIVATED' || user.status === 'REJECTED') {
            return res.status(403).json({ message: 'Account is not active. Please contact support.' });
        }

        let displayName = '';
        if(user.beneficiaryProfile) displayName = `${user.beneficiaryProfile.firstName} ${user.beneficiaryProfile.lastName}`;
        if(user.donorProfile) displayName = user.donorProfile.displayName;
        if(user.adminProfile) displayName = `${user.adminProfile.firstName} ${user.adminProfile.lastName}`;
        
        const token = jwt.sign(
            { userId: user.id, status: user.status},
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                displayName,
                status: user.status
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed, internal server error.' });
    }
}