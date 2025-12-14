import { Request, Response } from 'express';
import { getAllProgramsService, getProgramByIdService,createProgramService,updateProgramService  } from '../services/program.service.js';
import { 
  createProgramApplicationService,
  getProgramApplicationService,
  getBeneficiaryApplicationsService,
  scanApplicationQRCodeService,
  getProgramApplicationsService,
  getProgramApplicationStatsService,
  updateExpiredApplicationStatusesService,
} from '../services/programApplication.service.js';
import { ProgramData } from '../interfaces/interfaces.js';


export const createProgram = async (req: Request, res: Response) =>{
    try{
        console.log('Request Body:', req.body);
        const programData: ProgramData = req.body;
        const newProgram = await createProgramService(programData);
        res.status(201).json({success:true,data:newProgram});
    } catch(error){
        res.status(500).json({success:false,error:error.message})
    }
}
export const getAllPrograms = async (req: Request, res: Response) => {
    try {
        const programs = await getAllProgramsService();
        res.status(200).json({ success: true, data: programs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getProgramById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const program = await getProgramByIdService(id);

        if (!program) {
            return res.status(404).json({ success: false, error: 'Program not found' });
        }

        res.status(200).json({ success: true, data: program });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateProgram = async (req: Request, res: Response) => {
    try{
        const programId = req.params.id;
        const updateData: Partial<ProgramData> = req.body;
        const updatedProgram = await updateProgramService(programId, updateData);
        if(!updatedProgram){
            return res.status(404).json({ success: false, error: 'Program not found' });
        }
        res.status(200).json({ success: true, data: updatedProgram });
    }
    catch(error){
        res.status(500).json({ success: false, error: error.message });
    }   
}

// =========================================================
// PROGRAM APPLICATION ENDPOINTS
// =========================================================

/**
 * Register beneficiary for a program and create application with QR code
 */
export const registerForProgram = async (req: Request, res: Response) => {
    try {
        const { programId, beneficiaryId } = req.body;

        if (!programId || !beneficiaryId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: programId, beneficiaryId',
            });
        }

        // Check if beneficiary already registered
        const { PrismaClient } = await import('../../generated/prisma/index.js');
        const prisma = new PrismaClient();

        // Check if beneficiary already registered for this program
        const existingRegistration = await prisma.programRegistration.findUnique({
            where: {
                programId_beneficiaryId: { programId, beneficiaryId }
            }
        });

        if (existingRegistration) {
            await prisma.$disconnect();
            return res.status(409).json({
                success: false,
                error: 'Beneficiary is already registered for this program',
            });
        }

        const program = await prisma.program.findUnique({ where: { id: programId } });
        const beneficiary = await prisma.beneficiary.findUnique({
            where: { id: beneficiaryId },
            include: { user: true },
        });

        if (!program || !beneficiary) {
            await prisma.$disconnect();
            return res.status(404).json({
                success: false,
                error: 'Program or Beneficiary not found',
            });
        }

        // Create program registration
        const registration = await prisma.programRegistration.create({
            data: {
                programId,
                beneficiaryId,
                status: 'PENDING',
            },
        });

        await prisma.$disconnect();

        // Create program application with QR code
        const application = await createProgramApplicationService(
            registration.id,
            beneficiary.activeEmail || beneficiary.user?.email,
            `${beneficiary.firstName} ${beneficiary.lastName}`,
            program.title,
            program.date
        );

        res.status(201).json({
            success: true,
            message: 'Successfully registered for program and created application',
            data: {
                registration,
                application,
            },
        });
    } catch (error: any) {
        console.error('Error in registerForProgram:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to register for program',
        });
    }
};

/**
 * Get application details
 */
export const getApplicationById = async (req: Request, res: Response) => {
    try {
        const { applicationId } = req.params;

        const application = await getProgramApplicationService(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found',
            });
        }

        res.status(200).json({
            success: true,
            data: application,
        });
    } catch (error: any) {
        console.error('Error in getApplicationById:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch application',
        });
    }
};

/**
 * Get all applications for a beneficiary
 */
export const getBeneficiaryApplications = async (req: Request, res: Response) => {
    try {
        const { beneficiaryId } = req.params;

        const applications = await getBeneficiaryApplicationsService(beneficiaryId);

        res.status(200).json({
            success: true,
            data: applications,
        });
    } catch (error: any) {
        console.error('Error in getBeneficiaryApplications:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch beneficiary applications',
        });
    }
};

/**
 * Scan QR code (admin endpoint)
 */
export const scanQRCode = async (req: Request, res: Response) => {
    try {
        const { qrCodeValue, adminId, notes } = req.body;

        if (!qrCodeValue || !adminId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: qrCodeValue, adminId',
            });
        }

        const result = await scanApplicationQRCodeService(qrCodeValue, adminId, notes);

        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                application: result.application,
                scan: result.scan,
            },
        });
    } catch (error: any) {
        console.error('Error in scanQRCode:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to scan QR code',
        });
    }
};

/**
 * Get all applications for a program (admin)
 */
export const getApplicationsByProgram = async (req: Request, res: Response) => {
    try {
        const { programId } = req.params;

        const applications = await getProgramApplicationsService(programId);

        res.status(200).json({
            success: true,
            data: applications,
        });
    } catch (error: any) {
        console.error('Error in getApplicationsByProgram:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch program applications',
        });
    }
};

/**
 * Get application statistics for a program
 */
export const getApplicationStats = async (req: Request, res: Response) => {
    try {
        const { programId } = req.params;

        const stats = await getProgramApplicationStatsService(programId);

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error: any) {
        console.error('Error in getApplicationStats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch application statistics',
        });
    }
};

/**
 * Update expired applications (admin - should be called periodically)
 */
export const updateExpiredApplications = async (req: Request, res: Response) => {
    try {
        const result = await updateExpiredApplicationStatusesService();

        res.status(200).json({
            success: true,
            message: `Updated ${result.count} expired applications`,
            data: result,
        });
    } catch (error: any) {
        console.error('Error in updateExpiredApplications:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update expired applications',
        });
    }
};