/**
 * List pending beneficiaries
 * GET /api/admin/beneficiaries/pending
 */
export const getPendingBeneficiaries = async (req: Request, res: Response) => {
  try {
    const beneficiaries = await prisma.beneficiary.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
            profileImage: true
          }
        },
        address: true,
        familyMembers: true
      },
      orderBy: { user: { createdAt: 'desc' } }
    });
    return res.status(200).json({ success: true, data: beneficiaries });
  } catch (error) {
    console.error('Error fetching pending beneficiaries:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch pending beneficiaries', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

/**
 * List pending donors
 * GET /api/admin/donors/pending
 */
export const getPendingDonors = async (req: Request, res: Response) => {
  try {
    const donors = await prisma.donor.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
            profileImage: true
          }
        }
      },
      orderBy: { user: { createdAt: 'desc' } }
    });
    return res.status(200).json({ success: true, data: donors });
  } catch (error) {
    console.error('Error fetching pending donors:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch pending donors', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

/**
 * Delete a beneficiary application
 * DELETE /api/admin/beneficiaries/:id
 */
export const deleteBeneficiary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.beneficiary.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Beneficiary deleted' });
  } catch (error) {
    console.error('Error deleting beneficiary:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete beneficiary', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

/**
 * Delete a donor application
 * DELETE /api/admin/donors/:id
 */
export const deleteDonor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.donor.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Donor deleted' });
  } catch (error) {
    console.error('Error deleting donor:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete donor', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
/**
 * Approve a beneficiary application
 * PATCH /api/admin/beneficiaries/:id/approve
 */
export const approveBeneficiary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const beneficiary = await prisma.beneficiary.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewReason: null
      }
    });
    return res.status(200).json({ success: true, message: 'Beneficiary approved', data: beneficiary });
  } catch (error) {
    console.error('Error approving beneficiary:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve beneficiary', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

/**
 * Reject a beneficiary application
 * PATCH /api/admin/beneficiaries/:id/reject
 */
export const rejectBeneficiary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const beneficiary = await prisma.beneficiary.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewReason: reason || null
      }
    });
    return res.status(200).json({ success: true, message: 'Beneficiary rejected', data: beneficiary });
  } catch (error) {
    console.error('Error rejecting beneficiary:', error);
    return res.status(500).json({ success: false, message: 'Failed to reject beneficiary', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';

const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();

/**
 * Get admin dashboard statistics
 * GET /api/admin/dashboard-stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Total users count
    const totalUsers = await prisma.user.count();

    // Users with pending status
    const pendingUsers = await prisma.user.count({
      where: {
        status: 'PENDING'
      }
    });

    // Total programs (all programs)
    const allPrograms = await prisma.program.count();


    // Total monetary donations (sum of verified monetary donations)
    const monetaryDonations = await prisma.donation.aggregate({
      where: {
        paymentStatus: 'VERIFIED',
        monetaryAmount: {
          not: null
        }
      },
      _sum: {
        monetaryAmount: true
      }
    });
    const totalMonetaryDonations = monetaryDonations._sum.monetaryAmount || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        pendingUsers,
        allPrograms,
        totalMonetaryDonations
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get recent activity logs
 * GET /api/admin/recent-activity
 */
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;


    const activityLogs = await prisma.activityLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            email: true,
            beneficiaryProfile: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            donorProfile: {
              select: {
                displayName: true,
                donorType: true
              }
            },
            adminProfile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Format the activity logs for frontend
    const formattedLogs = activityLogs.map((log: any) => {
      let userName = log.user.email;
      if (log.user.beneficiaryProfile) {
        userName = `${log.user.beneficiaryProfile.firstName} ${log.user.beneficiaryProfile.lastName}`;
      } else if (log.user.donorProfile) {
        userName = `${log.user.donorProfile.displayName} (${log.user.donorProfile.donorType})`;
      } else if (log.user.adminProfile) {
        userName = `${log.user.adminProfile.firstName} ${log.user.adminProfile.lastName}`;
      }
      return {
        id: log.id,
        action: log.action,
        details: log.details,
        userName,
        userEmail: log.user.email,
        createdAt: log.createdAt
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedLogs
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all beneficiaries with pagination and filtering
 * GET /api/admin/beneficiaries
 */
export const getAllBeneficiariesForAdmin = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.user = {
        status: status
      };
    }

    // Get beneficiaries with pagination
    const beneficiaries = await prisma.beneficiary.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true
          }
        },
        address: true
      },
      orderBy: {
        user: {
          createdAt: 'desc'
        }
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.beneficiary.count({ where });

    return res.status(200).json({
      success: true,
      data: {
        beneficiaries,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch beneficiaries',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get beneficiary details by ID
 * GET /api/admin/beneficiaries/:id
 */
export const getBeneficiaryDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
            profileImage: true
          }
        },
        address: true,
        householdMembers: true,
        programRegistrations: {
          include: {
            program: {
              select: {
                title: true,
                date: true,
                status: true
              }
            }
          },
          orderBy: {
            registeredAt: 'desc'
          }
        }
      }
    });
    if (!beneficiary) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    }
    return res.status(200).json({ success: true, data: beneficiary });
  } catch (error) {
    console.error('Error fetching beneficiary details:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch beneficiary details', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

/**
 * Get all donors with pagination and filtering
 * GET /api/admin/donors
 */
export const getAllDonorsForAdmin = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.user = {
        status: status
      };
    }

    // Get donors with pagination
    const donors = await prisma.donor.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        user: {
          createdAt: 'desc'
        }
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.donor.count({ where });

    return res.status(200).json({
      success: true,
      data: {
        donors,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch donors',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get donor details by ID
 * GET /api/admin/donors/:id
 */
export const getDonorDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const donor = await prisma.donor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
            profileImage: true
          }
        },
        donations: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        stallReservations: {
          include: {
            program: {
              select: {
                title: true,
                eventDate: true
              }
            }
          },
          orderBy: {
            reservedAt: 'desc'
          }
        }
      }
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    console.error('Error fetching donor details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch donor details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
