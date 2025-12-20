import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

/**
 * Temporary test-only endpoint: GET /api/admin/beneficiaries/:id/verify?secret=...
 * Returns beneficiary with householdMembers and related user/address.
 * Protected by ADMIN_TEST_SECRET environment variable; do NOT commit a weak secret.
 */
export const getBeneficiaryForTest = async (req: Request, res: Response) => {
  const secret = req.query.secret as string;
  const expected = process.env.ADMIN_TEST_SECRET || 'dev-local-test-secret';
  if (!secret || secret !== expected) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.params;
  try {
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id },
      include: {
        user: true,
        householdMembers: true,
        address: true,
      }
    });
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Not found' });
    return res.status(200).json({ success: true, data: beneficiary });
  } catch (e) {
    console.error('Test endpoint error', e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
};