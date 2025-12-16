import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';

const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();

export const getAppMetrics = async (req: Request, res: Response) => {
  try {
    // Count total beneficiaries (families registered)
    const totalFamilies = await prisma.beneficiary.count();

    // Count meals distributed (program applications with COMPLETED status)
    const mealsDistributed = await prisma.programApplication.count({
      where: {
        applicationStatus: 'COMPLETED'
      }
    });

    // Count active programs
    const activePrograms = await prisma.program.count({
      where: {
        status: 'SCHEDULED'
      }
    });

    // Calculate community impact percentage
    // (Based on beneficiaries with improved food security)
    const totalBeneficiaries = await prisma.beneficiary.count();
    
    // Get unique beneficiaries with improved food security
    const beneficiariesWithImprovedSecurity = await prisma.foodSecuritySurvey.findMany({
      where: {
        severity: {
          in: ['SECURE', 'MILD']
        }
      },
      select: {
        beneficiaryId: true
      },
      distinct: ['beneficiaryId']
    });

    const communityImpactPercentage = totalBeneficiaries > 0
      ? Math.round((beneficiariesWithImprovedSecurity.length / totalBeneficiaries) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalFamilies,
        mealsDistributed,
        activePrograms,
        communityImpactPercentage
      }
    });
  } catch (error) {
    console.error('Error fetching app metrics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch app metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
