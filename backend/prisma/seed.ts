/* eslint-env node */
import { PrismaClient, Status, Gender, CivilStatus, DonorType, ProgramStatus, User, Donor, Beneficiary, Program } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'foodonation.org@gmail.com';
  const defaultPassword = 'secureAdmin123!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // --- Admin ---
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      adminProfile: {
        upsert: {
          update: { firstName: 'Super', lastName: 'Admin' },
          create: { firstName: 'Super', lastName: 'Admin' },
        },
      },
      status: Status.APPROVED,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      status: Status.APPROVED,
      adminProfile: { create: { firstName: 'Super', lastName: 'Admin' } },
    },
  });

  // --- Beneficiaries (Approved) ---
  const beneficiariesData = [
    {
      email: 'maryam.yusuf@example.com',
      firstName: 'Maryam',
      lastName: 'Yusuf',
      gender: Gender.FEMALE,
      birthDate: new Date('1992-04-12'),
      contactNumber: '+2348023456789',
      age: 33,
      civilStatus: CivilStatus.MARRIED,
      occupation: 'Vendor',
      householdNumber: 4,
      householdAnnualSalary: 95000,
      address: {
        streetNumber: '12 Unity St.',
        barangay: 'Wuse',
        municipality: 'Abuja',
        region: 'FCT',
        zipCode: '900103',
        country: 'Nigeria',
      },
    },
    {
      email: 'samuel.james@example.com',
      firstName: 'Samuel',
      lastName: 'James',
      gender: Gender.MALE,
      birthDate: new Date('1960-09-08'),
      contactNumber: '+2348031112222',
      age: 65,
      civilStatus: CivilStatus.MARRIED,
      occupation: 'Retired',
      householdNumber: 1,
      householdAnnualSalary: 60000,
      address: {
        streetNumber: '44 Creek Rd.',
        barangay: 'GRA Phase 2',
        municipality: 'Port Harcourt',
        region: 'Rivers',
        zipCode: '500101',
        country: 'Nigeria',
      },
    },
  ];

  const beneficiaryUsers: Array<User & { beneficiaryProfile: Beneficiary | null }> = [];
  for (const bene of beneficiariesData) {
    const user = await prisma.user.upsert({
      where: { email: bene.email },
      update: {
        status: Status.APPROVED,
        beneficiaryProfile: {
          upsert: {
            update: {
              firstName: bene.firstName,
              lastName: bene.lastName,
              gender: bene.gender,
              birthDate: bene.birthDate,
              contactNumber: bene.contactNumber,
              age: bene.age,
              civilStatus: bene.civilStatus,
              occupation: bene.occupation,
              householdNumber: bene.householdNumber,
              householdAnnualSalary: bene.householdAnnualSalary,
              address: {
                upsert: {
                  update: bene.address,
                  create: bene.address,
                },
              },
            },
            create: {
              firstName: bene.firstName,
              lastName: bene.lastName,
              gender: bene.gender,
              birthDate: bene.birthDate,
              contactNumber: bene.contactNumber,
              age: bene.age,
              civilStatus: bene.civilStatus,
              occupation: bene.occupation,
              householdNumber: bene.householdNumber,
              householdAnnualSalary: bene.householdAnnualSalary,
              address: { create: bene.address },
            },
          },
        },
      },
      create: {
        email: bene.email,
        password: hashedPassword,
        status: Status.APPROVED,
        beneficiaryProfile: {
          create: {
            firstName: bene.firstName,
            lastName: bene.lastName,
            gender: bene.gender,
            birthDate: bene.birthDate,
            contactNumber: bene.contactNumber,
            age: bene.age,
            civilStatus: bene.civilStatus,
            occupation: bene.occupation,
            householdNumber: bene.householdNumber,
            householdAnnualSalary: bene.householdAnnualSalary,
            address: { create: bene.address },
          },
        },
      },
      include: { beneficiaryProfile: true },
    });
    beneficiaryUsers.push(user);
  }

  // --- Donors (Approved) ---
  const donorsData = [
    {
      email: 'agroserve@example.com',
      displayName: 'AgroServe PLC',
      donorType: DonorType.BUSINESS,
    },
    {
      email: 'riverbank@example.com',
      displayName: 'Riverbank Church',
      donorType: DonorType.ORGANIZATION,
    },
  ];

  const donorUsers: Array<User & { donorProfile: Donor | null }> = [];
  for (const donor of donorsData) {
    const user = await prisma.user.upsert({
      where: { email: donor.email },
      update: {
        status: Status.APPROVED,
        donorProfile: {
          upsert: {
            update: {
              displayName: donor.displayName,
              donorType: donor.donorType,
            },
            create: {
              displayName: donor.displayName,
              donorType: donor.donorType,
            },
          },
        },
      },
      create: {
        email: donor.email,
        password: hashedPassword,
        status: Status.APPROVED,
        donorProfile: {
          create: {
            displayName: donor.displayName,
            donorType: donor.donorType,
          },
        },
      },
      include: { donorProfile: true },
    });
    donorUsers.push(user);
  }

  // --- Places & Donation Centers ---
  async function ensurePlace(name: string, address: string, latitude: number, longitude: number) {
    const existing = await prisma.place.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.place.create({ data: { name, address, latitude, longitude } });
  }

  const lagosWarehouse = await ensurePlace('Warehouse A - Lagos', 'Lagos, Nigeria', 6.5244, 3.3792);
  const abujaCenter = await ensurePlace('Warehouse B - Abuja', 'Abuja, Nigeria', 9.0765, 7.3986);

  async function ensureDonationCenter(placeId: string, contactInfo: string) {
    const existing = await prisma.donationCenter.findFirst({ where: { placeId } });
    if (existing) return existing;
    return prisma.donationCenter.create({ data: { placeId, contactInfo } });
  }

  const lagosDonationCenter = await ensureDonationCenter(lagosWarehouse.id, 'lagos-warehouse@example.com');
  const abujaDonationCenter = await ensureDonationCenter(abujaCenter.id, 'abuja-warehouse@example.com');

  // --- Programs ---
  const programsSeed = [
    {
      title: 'Winter Relief Drive',
      description: 'Seasonal food baskets and warm meal stations across key hubs.',
      date: new Date('2025-12-20T10:00:00Z'),
      maxParticipants: 250,
      currentParticipants: 0,
      placeId: lagosWarehouse.id,
      beneficiaries: ['maryam.yusuf@example.com', 'samuel.james@example.com'],
      donors: ['agroserve@example.com'],
    },
    {
      title: 'School Meals Pilot',
      description: 'Daily lunches for public primary schools in Lagos and Abuja.',
      date: new Date('2026-01-15T09:00:00Z'),
      maxParticipants: 400,
      currentParticipants: 0,
      placeId: abujaCenter.id,
      beneficiaries: ['maryam.yusuf@example.com'],
      donors: ['riverbank@example.com'],
    },
  ];

  const programs: Program[] = [];
  for (const prog of programsSeed) {
    const existing = await prisma.program.findFirst({ where: { title: prog.title } });
    let programRecord: Program;
    if (existing) {
      programRecord = await prisma.program.update({
        where: { id: existing.id },
        data: {
          description: prog.description,
          date: prog.date,
          maxParticipants: prog.maxParticipants,
          placeId: prog.placeId,
        },
      });
    } else {
      programRecord = await prisma.program.create({
        data: {
          title: prog.title,
          description: prog.description,
          date: prog.date,
          maxParticipants: prog.maxParticipants,
          currentParticipants: prog.currentParticipants,
          placeId: prog.placeId,
        },
      });
    }
    programs.push(programRecord);

    // Program Registrations for beneficiaries
    for (const beneEmail of prog.beneficiaries) {
      const beneUser = beneficiaryUsers.find((u) => u.email === beneEmail);
      if (!beneUser?.beneficiaryProfile?.id) continue;
      await prisma.programRegistration.upsert({
        where: {
          programId_beneficiaryId: {
            programId: programRecord.id,
            beneficiaryId: beneUser.beneficiaryProfile.id,
          },
        },
        update: { status: ProgramStatus.APPROVED },
        create: {
          programId: programRecord.id,
          beneficiaryId: beneUser.beneficiaryProfile.id,
          status: ProgramStatus.APPROVED,
        },
      });
    }
  }

  // --- Sample Donations aligned to donation centers ---
  await prisma.donation.upsert({
    where: { id: 'seed-donation-1' },
    update: {},
    create: {
      id: 'seed-donation-1',
      status: 'SCHEDULED',
      scheduledDate: new Date('2025-12-10T14:00:00Z'),
      donationCenterId: lagosDonationCenter.id,
      donorId: donorUsers[0]?.donorProfile?.id,
      items: {
        create: [
          { name: 'Rice', category: 'Food', quantity: 100, unit: 'kg' },
          { name: 'Beans', category: 'Food', quantity: 50, unit: 'kg' },
        ],
      },
    },
  });

  console.log('Seed completed: admin, beneficiaries, donors, programs, and sample donations ready.');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
