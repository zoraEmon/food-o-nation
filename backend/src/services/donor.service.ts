import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';

const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();

export type ReviewDecision = {
  approved: boolean;
  reason?: string;
};

export class DonorService {
  async getAll() {
    return prisma.donor.findMany({ include: { user: true } });
  }

  async getById(id: string) {
    return prisma.donor.findUnique({ where: { id }, include: { user: true } });
  }

  async reviewDonor(donorId: string, decision: ReviewDecision) {
    const status = decision.approved ? 'APPROVED' : 'REJECTED';

    const donor = await prisma.donor.update({
      where: { id: donorId },
      data: {
        status,
        reviewReason: decision.reason ?? null,
        reviewedAt: new Date(),
        user: {
          update: {
            status,
          },
        },
      },
      include: { user: true },
    });

    return donor;
  }

  async deleteRejectedOlderThan(days: number) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Find donors rejected before cutoff
    const stale = await prisma.donor.findMany({
      where: {
        status: 'REJECTED',
        reviewedAt: { lt: cutoff },
      },
      select: { id: true, userId: true },
    });

    if (stale.length === 0) return { deleted: 0 };

    // Delete related user records as requested
    const userIds = stale.map(s => s.userId).filter(Boolean) as string[];

    await prisma.donor.deleteMany({
      where: { id: { in: stale.map(s => s.id) } },
    });

    if (userIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }

    return { deleted: stale.length };
  }
}
