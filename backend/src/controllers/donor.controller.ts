import { Request, Response } from 'express';
import { DonorService } from '../services/donor.service.js';
import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';

const donorService = new DonorService();
const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();

export const listDonors = async (req: Request, res: Response) => {
  try {
    const donors = await donorService.getAll();
    res.json({ success: true, data: donors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to list donors' });
  }
};

export const getDonor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const donor = await donorService.getById(id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
    res.json({ success: true, data: donor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch donor' });
  }
};

export const reviewDonor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approved, reason } = req.body as { approved: boolean; reason?: string };
  if (typeof approved !== 'boolean') {
    return res.status(400).json({ success: false, message: 'approved must be boolean' });
  }

  try {
    const donor = await donorService.reviewDonor(id, { approved, reason });
    res.json({ success: true, data: donor });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.status(500).json({ success: false, message: error?.message || 'Failed to review donor' });
  }
};

/**
 * Get top donors for acknowledgement page
 * Includes top monetary and top goods donors
 */
export const getTopDonors = async (req: Request, res: Response) => {
  try {
    // Get top monetary donors (all donors with monetary donations, regardless of status)
    const monetaryDonors = await prisma.donor.findMany({
      where: {
        donations: {
          some: {
            monetaryAmount: { not: null }
          }
        }
      },
      select: {
        id: true,
        displayName: true,
        donorType: true,
        totalDonation: true,
        _count: {
          select: {
            donations: {
              where: {
                monetaryAmount: { not: null }
              }
            }
          }
        }
      },
      orderBy: {
        totalDonation: 'desc'
      },
      take: 10
    });

    // Calculate tier based on totalDonation
    const monetaryWithTier = monetaryDonors.map(donor => {
      const amount = donor.totalDonation || 0;
      let tier = 'Bronze';
      if (amount >= 100000) tier = 'Platinum';
      else if (amount >= 50000) tier = 'Gold';
      else if (amount >= 10000) tier = 'Silver';

      return {
        name: donor.displayName,
        tier,
        totalDonation: amount,
        donationCount: donor._count.donations
      };
    });

    // Get top goods donors (only those with item donations, excluding pure monetary donors)
    const goodsDonors = await prisma.donor.findMany({
      where: {
        donations: {
          some: {
            AND: [
              {
                items: {
                  some: {}
                }
              },
              {
                monetaryAmount: null
              }
            ]
          }
        }
      },
      select: {
        id: true,
        displayName: true,
        donations: {
          where: {
            AND: [
              {
                items: {
                  some: {}
                }
              },
              {
                monetaryAmount: null
              }
            ]
          },
          select: {
            items: {
              select: {
                name: true,
                quantity: true,
                unit: true,
                category: true
              }
            }
          }
        }
      },
      take: 10
    });

    // Aggregate items for each goods donor
    const goodsWithItems = goodsDonors.map(donor => {
      const allItems = donor.donations.flatMap(d => d.items);
      
      // Group items by category
      const itemsByCategory: Record<string, { quantity: number; unit: string }> = {};
      allItems.forEach(item => {
        if (!itemsByCategory[item.category]) {
          itemsByCategory[item.category] = { quantity: 0, unit: item.unit };
        }
        itemsByCategory[item.category].quantity += item.quantity;
      });

      // Create summary string
      const itemsSummary = Object.entries(itemsByCategory)
        .slice(0, 3) // Top 3 categories
        .map(([category, data]) => `${data.quantity} ${data.unit} ${category}`)
        .join(', ');

      return {
        name: donor.displayName,
        items: itemsSummary || 'Various goods',
        totalItems: allItems.length
      };
    });

    res.json({
      success: true,
      data: {
        monetaryDonors: monetaryWithTier,
        goodsDonors: goodsWithItems
      }
    });
  } catch (error: any) {
    console.error('Error fetching top donors:', error);
    res.status(500).json({ 
      success: false, 
      message: error?.message || 'Failed to fetch top donors' 
    });
  }
};
