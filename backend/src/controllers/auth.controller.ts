import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';
import { loginSchema, registerBeneficiarySchema, registerDonorSchema } from '../utils/validators.js';
import { SURVEY_OPTIONS } from '../constants/surveyOptions.js';
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

// Dev OTP storage removed (SMS/dev-OTP flow disabled)

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
        console.log('📥 Received registration request');
        console.log('Body keys:', Object.keys(req.body));
        console.log('Files:', req.files);
        
        // 1. Handle Multiple File Paths
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        let profileImagePath = null;
        let governmentIdPath = null;
        let signaturePath = null;
        
        if (files?.profileImage?.[0]) {
            profileImagePath = files.profileImage[0].path.replace(/\\/g, "/");
        }
        if (files?.governmentIdFile?.[0]) {
            governmentIdPath = files.governmentIdFile[0].path.replace(/\\/g, "/");
        }
        if (files?.signature?.[0]) {
            signaturePath = files.signature[0].path.replace(/\\/g, "/");
        }

        // 2. Validate Text Data
        const result = registerBeneficiarySchema.safeParse(req.body);
        
        if (!result.success) {
            // Cleanup: Delete uploaded files if validation fails
            if (files?.profileImage?.[0]) fs.unlinkSync(files.profileImage[0].path);
            if (files?.governmentIdFile?.[0]) fs.unlinkSync(files.governmentIdFile[0].path);
            if (files?.signature?.[0]) fs.unlinkSync(files.signature[0].path);
            return res.status(400).json({ errors: result.error.format() });
        }

        const data = result.data as any;
        console.log('[Auth] Validation passed for', data.email);

        // Defensive fallbacks: when using multipart/form-data some complex fields
        // may arrive as JSON strings despite Zod preprocessing — handle explicit parsing here.
        const fallbackParse = (raw: any) => {
            if (!raw) return undefined;
            if (Array.isArray(raw)) return raw;
            if (typeof raw === 'string') {
                try { return JSON.parse(raw); } catch { return undefined; }
            }
            return undefined;
        };

        const householdMembers = data.householdMembers || fallbackParse(req.body.householdMembers) || undefined;
        const surveyAnswersRaw = data.surveyAnswers || fallbackParse(req.body.surveyAnswers) || undefined;
        const incomeSourcesRaw = data.incomeSources || fallbackParse(req.body.incomeSources) || undefined;
        const governmentIdType = data.governmentIdType || req.body.governmentIdType || undefined;

        // Map human-friendly income source strings to Prisma enum values
        const mapIncomeSource = (s: string) => {
            if (!s || typeof s !== 'string') return undefined;
            const v = s.trim().toLowerCase();
            if (v.includes('formal') || v.includes('salar')) return 'FORMAL_SALARIED';
            if (v.includes('inform') || v.includes('gig') || v.includes('odd') || v.includes('self')) return 'INFORMAL_GIG';
            if (v.includes('gov') || v.includes('government') || v.includes('assistance')) return 'GOV_ASSISTANCE';
            if (v.includes('remit') || v.includes('remittance')) return 'REMITTANCE';
            if (v === 'none' || v === 'n/a' || v === 'na') return 'NONE';
            // try match exact enum names
            const up = s.toUpperCase().replace(/[^A-Z_]/g, '_');
            if (['FORMAL_SALARIED','INFORMAL_GIG','GOV_ASSISTANCE','REMITTANCE','NONE'].includes(up)) return up;
            return undefined;
        };

        const incomeSources = Array.isArray(incomeSourcesRaw)
            ? incomeSourcesRaw.map((x: any) => mapIncomeSource(String(x))).filter(Boolean)
            : (typeof incomeSourcesRaw === 'string' ? (mapIncomeSource(incomeSourcesRaw) ? [mapIncomeSource(incomeSourcesRaw)] : []) : undefined);

        // Log parsed application fields to help debug missing associations
        console.log('Parsed registration fields:');
        console.log(' - householdMembers:', Array.isArray(householdMembers) ? householdMembers.length : householdMembers);
        console.log(' - incomeSourcesRaw:', incomeSourcesRaw);
        console.log(' - incomeSources(mapped):', incomeSources);
        console.log(' - governmentIdType:', governmentIdType);
        console.log(' - monthlyIncome:', data.monthlyIncome);
        console.log(' - mainEmploymentStatus:', data.mainEmploymentStatus);
        console.log(' - receivingAid:', data.receivingAid, 'detail:', data.receivingAidDetail);
        console.log(' - declarationAccepted:', data.declarationAccepted, 'privacyAccepted:', data.privacyAccepted);
        console.log(' - surveyAnswersRaw:', Array.isArray(surveyAnswersRaw) ? surveyAnswersRaw.length : surveyAnswersRaw);

        // 3. Check for Existing Email - Verify email is unique across all users
        console.log('[Auth] Checking existing user for', data.email);
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        console.log('[Auth] Existing user check result:', !!existingUser);
        if (existingUser) {
            // Cleanup uploaded files
            if (files?.profileImage?.[0]) fs.unlinkSync(files.profileImage[0].path);
            if (files?.governmentIdFile?.[0]) fs.unlinkSync(files.governmentIdFile[0].path);
            if (files?.signature?.[0]) fs.unlinkSync(files.signature[0].path);
            
            // Provide specific message based on existing user's role
            let roleMessage = "an account";
            if (existingUser.donorProfile) {
                roleMessage = "a donor account";
            } else if (existingUser.beneficiaryProfile) {
                roleMessage = "a beneficiary account";
            } else if (existingUser.adminProfile) {
                roleMessage = "an admin account";
            }
            
            return res.status(400).json({ 
                message: `This email is already registered with ${roleMessage}. Please use a different email or log in to your existing account.` 
            });
        }

        // 4. Hash Password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 5. Generate OTP and Set Expiry
        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
        // Dev OTP storage removed; OTP will only be sent via email for now

        // 6. Prepare optional survey answers data and Create User & Beneficiary Profile
        let newUser: any;
        try {
            // Build nested create payload for food security survey answers if provided
            let foodSecuritySurveysData: any = undefined;
            if (Array.isArray(surveyAnswersRaw) && surveyAnswersRaw.length > 0) {
                try {
                    // collect questionIds from provided answers
                    const questionIds = surveyAnswersRaw.map((a: any) => String(a.questionId)).filter(Boolean);
                    // fetch questions to determine the question type
                    const questions = await prisma.question.findMany({ where: { id: { in: questionIds } } });
                    const questionMap: Record<string, any> = {};
                    questions.forEach((q: any) => { questionMap[q.id] = q; });

                    const answersCreate = surveyAnswersRaw.map((ans: any) => {
                        const q = questionMap[String(ans.questionId)];
                        const rawResp = ans.response;
                        if (!q || rawResp === undefined || rawResp === null) {
                            // Unknown question or missing response - skip
                            return null;
                        }

                        // Map human label or value to enum value using SURVEY_OPTIONS
                        const options = SURVEY_OPTIONS[q.type] || [];
                        const respStr = String(rawResp).trim();
                        // try exact value match
                        let mapped = options.find(o => o.value === respStr.toUpperCase());
                        if (!mapped) {
                            // try label match (case-insensitive)
                            mapped = options.find(o => o.label.toLowerCase() === respStr.toLowerCase());
                        }
                        if (!mapped) {
                            // also accept raw enum-like tokens (e.g., 'RARELY')
                            const upper = respStr.toUpperCase().replace(/[^A-Z_]/g, '_');
                            mapped = options.find(o => o.value === upper);
                        }
                        if (!mapped) {
                            // Could not map response to enum - log and skip
                            console.warn(`Survey answer skipped: questionId=${q.id} response=${respStr} (no matching option)`);
                            return null;
                        }

                        if (q.type === 'FOOD_FREQUENCY') {
                            return { questionId: q.id, foodFrequencyResponse: mapped.value };
                        }
                        if (q.type === 'FOOD_SECURITY_SEVERITY') {
                            return { questionId: q.id, foodSeverityResponse: mapped.value };
                        }
                        // default fallback
                        return { questionId: q.id, foodFrequencyResponse: mapped.value };
                    }).filter(Boolean);

                    if (answersCreate.length > 0) {
                        foodSecuritySurveysData = {
                            create: [
                                {
                                    answers: { create: answersCreate }
                                }
                            ]
                        };
                    }
                } catch (err) {
                    console.error('Error preparing survey answers for persistence:', err);
                    foodSecuritySurveysData = undefined;
                }
            }
            // Compute ages and household composition server-side
            const calcAge = (d: any) => {
                try {
                    const bd = new Date(d);
                    if (isNaN(bd.getTime())) return null;
                    const diff = Date.now() - bd.getTime();
                    const ageDt = new Date(diff);
                    return Math.abs(ageDt.getUTCFullYear() - 1970);
                } catch (e) {
                    return null;
                }
            };

            const applicantAge = calcAge(data.birthDate) ?? (typeof data.age === 'number' ? data.age : undefined);

            const membersArray = Array.isArray(householdMembers) ? householdMembers : [];
            const membersWithAge = membersArray.map((m: any) => ({
                fullName: m.fullName,
                birthDate: new Date(m.birthDate),
                age: (calcAge(m.birthDate) ?? (typeof m.age === 'number' ? m.age : null)),
                relationship: m.relationship
            }));

            // Category thresholds: child <18, adult 18-59, senior >=60
            let computedChildren = 0;
            let computedAdult = 0;
            let computedSenior = 0;

            const tallyAge = (ageVal: any) => {
                if (ageVal === null || ageVal === undefined) return;
                const a = Number(ageVal);
                if (Number.isNaN(a)) return;
                if (a < 18) computedChildren++;
                else if (a >= 60) computedSenior++;
                else computedAdult++;
            };

            // Tally household members
            membersWithAge.forEach(m => tallyAge(m.age));
            // Include applicant in counts
            tallyAge(applicantAge);

            const computedHouseholdNumber = membersWithAge.length + 1; // members + applicant

            newUser = await prisma.user.create({
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
                        
                        age: applicantAge ?? data.age,
                        birthDate: new Date(data.birthDate),
                        contactNumber: data.contactNumber,
                        householdNumber: computedHouseholdNumber,
                        householdAnnualSalary: data.householdAnnualSalary,
                        
                        // Application details
                        householdPosition: data.householdPosition,
                        householdPositionDetail: data.householdPositionDetail,
                        primaryPhone: data.primaryPhone,
                        activeEmail: data.activeEmail,
                        governmentIdType: data.governmentIdType,
                        governmentIdFileUrl: governmentIdPath,
                        
                        // Household composition (computed server-side)
                        childrenCount: computedChildren,
                        adultCount: computedAdult,
                        seniorCount: computedSenior,
                        pwdCount: data.pwdCount,
                        
                        // Health/Diet
                        specialDietRequired: data.specialDietRequired,
                        specialDietDescription: data.specialDietDescription,
                        
                        // Economic
                        monthlyIncome: data.monthlyIncome,
                        incomeSources: Array.isArray(incomeSources) && incomeSources.length > 0 ? incomeSources : undefined,
                        mainEmploymentStatus: data.mainEmploymentStatus,
                        receivingAid: data.receivingAid,
                        receivingAidDetail: data.receivingAidDetail,
                        
                        // Consent
                        declarationAccepted: data.declarationAccepted,
                        privacyAccepted: data.privacyAccepted,
                        signatureUrl: signaturePath,
                        
                        address: {
                            create: {
                                streetNumber: data.streetNumber,
                                barangay: data.barangay,
                                province: data.province,
                                municipality: data.municipality,
                                region: data.region || 'NCR',
                                zipCode: data.zipCode || '0000',
                                country: 'Philippines'
                            }
                        },
                        
                        // Household members (use parsed/fallback array)
                        householdMembers: membersWithAge && membersWithAge.length > 0 ? {
                            create: membersWithAge.map((member: any) => ({
                                fullName: member.fullName,
                                birthDate: member.birthDate,
                                age: member.age,
                                relationship: member.relationship
                            }))
                        } : undefined,

                                                // Optional: persist provided food security survey answers
                                                foodSecuritySurveys: foodSecuritySurveysData
                    }
                }
            },
            include: {
                beneficiaryProfile: true
            }
            });
        } catch (dbErr) {
            console.error('Register Beneficiary DB Error:', dbErr);
            // Cleanup uploaded files
            if (files?.profileImage?.[0]) fs.unlinkSync(files.profileImage[0].path);
            if (files?.governmentIdFile?.[0]) fs.unlinkSync(files.governmentIdFile[0].path);
            if (files?.signature?.[0]) fs.unlinkSync(files.signature[0].path);
            return res.status(500).json({ message: 'Database error during registration', detail: String(dbErr) });
        }

        // 7. Send OTP Email
        try {
            console.log('[Auth] sending OTP email to', newUser.email);
            await emailService.sendOTP(newUser.email, otp);
            console.log('[Auth] OTP email sent to', newUser.email);
        } catch (emailErr) {
            console.error('[Auth] Failed to send OTP email:', emailErr);
        }

        // SMS sending disabled: OTP will be delivered via email only

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
        
        // Handle unique constraint violations from database
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            return res.status(400).json({ 
                message: "This email is already registered. Please use a different email." 
            });
        }
        
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

        // 3. Check Email - Verify email is unique across all users
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            if (req.file) fs.unlinkSync(req.file.path);
            
            // Provide specific message based on existing user's role
            let roleMessage = "an account";
            if (existingUser.beneficiaryProfile) {
                roleMessage = "a beneficiary account";
            } else if (existingUser.donorProfile) {
                roleMessage = "a donor account";
            } else if (existingUser.adminProfile) {
                roleMessage = "an admin account";
            }
            
            return res.status(400).json({ 
                message: `This email is already registered with ${roleMessage}. Please use a different email or log in to your existing account.` 
            });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 4. Generate OTP and Set Expiry
        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
        // Dev OTP storage removed; OTP will only be sent via email for now

        // 5. Create User with Donor Profile (Status: PENDING - waiting for admin approval)
        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                status: "PENDING", // Requires admin approval for donors
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

        // SMS sending disabled: OTP will be delivered via email only

        res.status(201).json({
            message: "Registration successful! Please check your email for your verification code. After verification, your account will be pending admin approval.",
            userId: newUser.id,
            requireVerification: true, // Indicate to frontend that OTP is required
            pendingApproval: true // Indicate that admin approval is required
        });

    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error("Register Donor Error:", error);
        
        // Handle unique constraint violations from database
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            return res.status(400).json({ 
                message: "This email is already registered. Please use a different email." 
            });
        }
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

        const { email, password, loginType } = result.data;

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

        // PENDING users can log in but with limited access

        // ✅ NEW: Validate that user has the correct role
        const hasRequestedRole = 
            (loginType === 'BENEFICIARY' && user.beneficiaryProfile) ||
            (loginType === 'DONOR' && user.donorProfile) ||
            (loginType === 'ADMIN' && user.adminProfile);

        if (!hasRequestedRole) {
            // Provide helpful message about what role this account actually has
            let actualRole = "None";
            if (user.beneficiaryProfile) actualRole = "Beneficiary";
            if (user.donorProfile) actualRole = "Donor";
            if (user.adminProfile) actualRole = "Admin";
            
            return res.status(403).json({ 
                message: `This account is registered as a ${actualRole}. Please log in with the correct login type or use a different account.`
            });
        }

        // ✅ NEW: Check if user is not verified - require OTP
        if (!user.isVerified) {
            // Check if OTP has expired
            const isOtpExpired = user.otpExpiresAt && user.otpExpiresAt < new Date();
            
            if (isOtpExpired || !user.otpCode) {
                // Regenerate OTP for this login attempt
                const newOtp = generateOTP();
                const hashedOtp = await hashOTP(newOtp);
                const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
                
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        otpCode: hashedOtp,
                        otpExpiresAt: otpExpiresAt,
                    }
                });

                // SMS sending and dev-OTP storage disabled; a new OTP is sent via email only
                await emailService.sendOTP(user.email, newOtp);
            }

            // Return special response indicating OTP verification needed
            return res.status(200).json({
                requiresOtpVerification: true,
                userId: user.id,
                email: user.email,
                message: "Please verify your email address. A verification code has been sent to your email."
            });
        }

        const roles: string[] = [];
        let displayName = user.email;
        let donorId: string | undefined;
        let beneficiaryId: string | undefined;

        if (user.adminProfile) {
            roles.push('ADMIN');
            displayName = `${user.adminProfile.firstName} ${user.adminProfile.lastName}`;
        }
        if (user.donorProfile) {
            roles.push('DONOR');
            donorId = user.donorProfile.id;
            if(roles.length === 1) displayName = user.donorProfile.displayName;
        }
        if (user.beneficiaryProfile) {
            roles.push('BENEFICIARY');
            beneficiaryId = user.beneficiaryProfile.id;
            if(roles.length === 1) displayName = `${user.beneficiaryProfile.firstName} ${user.beneficiaryProfile.lastName}`;
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                status: user.status, 
                roles: roles,
                donorId,
                beneficiaryId
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                displayName,
                email: user.email,
                status: user.status,
                roles: roles,
                donorId,
                beneficiaryId
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

        // Dev OTP clearing removed (dev OTP feature disabled)

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

// New: Verify Donor OTP (by userId instead of email)
export const verifyDonorOtp = async (req: Request, res: Response) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({ message: "User ID and OTP are required." });
        }

        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            include: {
                beneficiaryProfile: true,
                donorProfile: true,
                adminProfile: true,
            }
        });

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
            // Clear OTP fields to prevent brute-forcing
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    otpCode: null,
                    otpExpiresAt: null,
                },
            });
            return res.status(400).json({ message: isOtpExpired ? "OTP expired." : "Incorrect OTP." });
        }

        // OTP is valid, verify the user (keep status as PENDING for admin to approve)
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                // Keep PENDING status - admin must approve the donor
                otpCode: null,
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
        let donorId: string | undefined;
        let beneficiaryId: string | undefined;

        if (updatedUser.adminProfile) {
            roles.push("ADMIN");
            displayName = `${updatedUser.adminProfile.firstName} ${updatedUser.adminProfile.lastName}`;
        }
        if (updatedUser.donorProfile) {
            roles.push("DONOR");
            donorId = updatedUser.donorProfile.id;
            if(roles.length === 1) displayName = updatedUser.donorProfile.displayName;
        }
        if (updatedUser.beneficiaryProfile) {
            roles.push("BENEFICIARY");
            beneficiaryId = updatedUser.beneficiaryProfile.id;
            if(roles.length === 1) displayName = `${updatedUser.beneficiaryProfile.firstName} ${updatedUser.beneficiaryProfile.lastName}`;
        }

        const token = jwt.sign(
            { 
                userId: updatedUser.id, 
                status: updatedUser.status, 
                roles: roles,
                donorId,
                beneficiaryId
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Email verified successfully!",
            token,
            data: {
                token,
                user: {
                    id: updatedUser.id,
                    displayName,
                    status: updatedUser.status,
                    roles: roles,
                    isVerified: updatedUser.isVerified,
                    donorId,
                    beneficiaryId
                },
                donorId,
                beneficiaryId
            }
        });

    } catch (error) {
        console.error("Verify Donor OTP Error:", error);
        res.status(500).json({ message: "Failed to verify OTP, internal server error." });
    }
};
