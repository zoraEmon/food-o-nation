import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { loginSchema, registerBeneficiarySchema, registerDonorSchema } from "../utils/validators.js"; // Make sure path is correct
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'foodONationSecret';

//Context aware na pag login.
export const login = async (req: Request, res: Response) => {
    try {
        // 1. Validate Input (Now includes loginType)
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.format() });
        }

        const { email, password, loginType } = result.data;

        // 2. Fetch User and ALL profiles
        const user = await prisma.user.findUnique({ 
            where: { email }, 
            include: {
                beneficiaryProfile: true,
                donorProfile: true,
                adminProfile: true,
            }
        });

        // 3. Basic Credentials Check
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 4. Account Status Check
        if (user.status === 'DEACTIVATED' || user.status === 'REJECTED') {
            return res.status(403).json({ message: 'Account is not active. Please contact support.' });
        }

        // If trying to login on Beneficiary Form...
        if (loginType === 'BENEFICIARY' && !user.beneficiaryProfile) {
            return res.status(403).json({ 
                message: "Access Denied: No Beneficiary account found for this user." 
            });
        }

        // If trying to login on Donor Form...
        if (loginType === 'DONOR' && !user.donorProfile) {
            return res.status(403).json({ 
                message: "Access Denied: No Donor account found for this user." 
            });
        }

        // If trying to login on Admin Form...
        if (loginType === 'ADMIN' && !user.adminProfile) {
            return res.status(403).json({ 
                message: "Access Denied: You are not an Admin." 
            });
        }

        // Determine Display Name based strictly on the loginType
        let displayName = user.email; 
        if (loginType === 'BENEFICIARY' && user.beneficiaryProfile) {
            displayName = `${user.beneficiaryProfile.firstName} ${user.beneficiaryProfile.lastName}`;
        } else if (loginType === 'DONOR' && user.donorProfile) {
            displayName = user.donorProfile.displayName;
        } else if (loginType === 'ADMIN' && user.adminProfile) {
            displayName = `${user.adminProfile.firstName} ${user.adminProfile.lastName}`;
        }

        // Determine Roles (We still calculate all roles, in case you want to allow switching later)
        const roles: string[] = [];
        if (user.adminProfile) roles.push('ADMIN');
        if (user.donorProfile) roles.push('DONOR');
        if (user.beneficiaryProfile) roles.push('BENEFICIARY');

        // Generate Token
        const token = jwt.sign(
            { 
                userId: user.id, 
                status: user.status, 
                roles: roles,
                currentContext: loginType // info para makita kung Pano nag login yung user.
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
                roles: roles,
                loginType: loginType // Send back confirming which mode they are in
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Login failed, internal server error.' });
    }
}