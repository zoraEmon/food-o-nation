import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';
import {
  BeneficiaryData,
  HouseholdMemberInput,
  AddressInput,
} from '../interfaces/interfaces.js';

const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();

const toDate = (value: string | Date): Date => {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date format. Use ISO 8601.');
  }
  return d;
};

export const getAllBeneficiaryService = async () => {
  return prisma.beneficiary.findMany({
    include: {
      user: true,
      address: true,
      householdMembers: true,
      programRegistrations: true,
      foodSecuritySurveys: true,
    },
  });
};

export const getBeneficiaryByIdService = async (id: string) => {
  return prisma.beneficiary.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      householdMembers: true,
      programRegistrations: true,
      foodSecuritySurveys: true,
    },
  });
};

export const createBeneficiaryService = async (data: BeneficiaryData) => {
  const {
    address,
    householdMembers = [],
    birthDate,
    householdAnnualSalary,
    monthlyIncome,
    ...rest
  } = data;

  const newBeneficiary = await prisma.beneficiary.create({
    data: {
      ...rest,
      birthDate: toDate(birthDate),
      householdAnnualSalary: householdAnnualSalary ?? null,
      monthlyIncome: monthlyIncome ?? null,
      address: address
        ? {
            create: mapAddress(address),
          }
        : undefined,
      householdMembers: householdMembers.length
        ? {
            create: householdMembers.map(mapMember),
          }
        : undefined,
    },
    include: {
      user: true,
      address: true,
      householdMembers: true,
    },
  });

  return newBeneficiary;
};

export const updateBeneficiaryService = async (
  beneficiaryId: string,
  updateData: Partial<BeneficiaryData>
) => {
  const { address, householdMembers, birthDate, householdAnnualSalary, monthlyIncome, ...rest } = updateData;

  const data: any = {
    ...rest,
    birthDate: birthDate ? toDate(birthDate) : undefined,
    householdAnnualSalary: householdAnnualSalary ?? undefined,
    monthlyIncome: monthlyIncome ?? undefined,
  };

  if (address) {
    data.address = {
      upsert: {
        update: mapAddress(address),
        create: mapAddress(address),
      },
    };
  }

  if (householdMembers) {
    data.householdMembers = {
      deleteMany: { beneficiaryId },
      create: householdMembers.map(mapMember),
    };
  }

  try {
    return await prisma.beneficiary.update({
      where: { id: beneficiaryId },
      data,
      include: {
        user: true,
        address: true,
        householdMembers: true,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error(`Beneficiary with id ${beneficiaryId} not found.`);
    }
    throw new Error('Failed to update beneficiary: ' + error.message);
  }
};

export const reviewBeneficiaryService = async (
  beneficiaryId: string,
  approved: boolean,
  reason?: string
) => {
  const status = approved ? 'APPROVED' : 'REJECTED';
  const userStatus = approved ? 'APPROVED' : 'REJECTED';
  try {
    return await prisma.beneficiary.update({
      where: { id: beneficiaryId },
      data: {
        status,
        reviewReason: reason ?? null,
        reviewedAt: new Date(),
        user: {
          update: {
            status: userStatus,
          },
        },
      },
      include: {
        user: true,
        address: true,
        householdMembers: true,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      const notFound: any = new Error(`Beneficiary with id ${beneficiaryId} not found.`);
      notFound.code = 'P2025';
      throw notFound;
    }
    throw new Error('Failed to review beneficiary: ' + error.message);
  }
};

export const deleteRejectedBeneficiariesOlderThan = async (days: number) => {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stale = await prisma.beneficiary.findMany({
    where: { status: 'REJECTED', reviewedAt: { lt: cutoff } },
    select: { id: true, userId: true },
  });

  if (!stale.length) return { deleted: 0 };

  await prisma.beneficiary.deleteMany({ where: { id: { in: stale.map(s => s.id) } } });

  const userIds = stale.map(s => s.userId).filter(Boolean) as string[];
  if (userIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }

  return { deleted: stale.length };
};

const mapMember = (m: HouseholdMemberInput) => ({
  fullName: m.fullName,
  birthDate: toDate(m.birthDate),
  age: m.age,
  relationship: m.relationship,
});

const mapAddress = (a: AddressInput) => ({
  streetNumber: a.streetNumber,
  barangay: a.barangay,
  municipality: a.municipality,
  region: a.region ?? '',
  country: a.country ?? 'Philippines',
  zipCode: a.zipCode ?? '',
});