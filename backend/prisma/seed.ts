import { PrismaClient, DonorType, Gender, CivilStatus, HouseholdPosition, MainEmploymentStatus, IncomeSource } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...\n');

  // ============================================
  // 1. SEED ADMIN USER
  // ============================================
  console.log('👤 Seeding Admin User...');
  const adminEmail = 'foodonation.org@gmail.com';
  const adminPassword = 'secureAdmin123!';

  const existingAdminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let adminUser;
  if (existingAdminUser) {
    console.log('   ℹ️  Admin user already exists. Skipping...');
    adminUser = existingAdminUser;
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        status: 'APPROVED',
        adminProfile: {
          create: {
            firstName: 'Super',
            lastName: 'Admin',
          },
        },
      },
    });
    console.log(`   ✅ Created admin user: ${adminUser.email}`);
  }

  // ============================================
  // 2. SEED TEST DONORS (FOR TESTING ONLY)
  // ============================================
  console.log('\n🎁 Seeding Test Donors...');

  const testDonors = [
    {
      email: 'john.donor@test.com',
      password: 'TestPassword123!',
      displayName: 'John Generous Donor',
      donorType: DonorType.INDIVIDUAL,
    },
    {
      email: 'maria.philanthropist@test.com',
      password: 'TestPassword123!',
      displayName: 'Maria Philanthropist',
      donorType: DonorType.INDIVIDUAL,
    },
    {
      email: 'abc.corporation@test.com',
      password: 'TestPassword123!',
      displayName: 'ABC Corporation',
      donorType: DonorType.ORGANIZATION,
    },
    {
      email: 'good.samaritan.foundation@test.com',
      password: 'TestPassword123!',
      displayName: 'Good Samaritan Foundation',
      donorType: DonorType.ORGANIZATION,
    },
    {
      email: 'local.bakery@test.com',
      password: 'TestPassword123!',
      displayName: 'Local Bakery Shop',
      donorType: DonorType.BUSINESS,
    },
  ];

  const createdDonors = [];

  for (const donor of testDonors) {
    const existingUser = await prisma.user.findUnique({
      where: { email: donor.email },
    });

    if (existingUser) {
      console.log(`   ℹ️  Donor already exists: ${donor.email}`);
      const existingDonor = await prisma.donor.findUnique({
        where: { userId: existingUser.id },
      });
      if (existingDonor) {
        createdDonors.push(existingDonor);
      }
      continue;
    }

    const hashedPassword = await bcrypt.hash(donor.password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: donor.email,
        password: hashedPassword,
        status: 'APPROVED',
        donorProfile: {
          create: {
            displayName: donor.displayName,
            donorType: donor.donorType,
            totalDonation: 0,
            points: 0,
          },
        },
      },
      include: {
        donorProfile: true,
      },
    });

    createdDonors.push(newUser.donorProfile!);
    console.log(`   ✅ Created donor: ${donor.displayName} (${donor.email})`);
  }

  // ============================================
  // 3. SEED DONATION CENTERS (FOR TESTING ONLY)
  // ============================================
  console.log('\n🏢 Seeding Donation Centers...');

  const donationCenters = [
    {
      name: 'Main Distribution Center - Quezon City',
      address: '123 Commonwealth Avenue, Quezon City, Metro Manila',
      latitude: 14.6760,
      longitude: 121.0437,
      contactInfo: 'qc.center@foodonation.org | +63 917 123 4567',
    },
    {
      name: 'Manila Central Food Hub',
      address: '456 Rizal Avenue, Manila City, Metro Manila',
      latitude: 14.5995,
      longitude: 120.9842,
      contactInfo: 'manila.hub@foodonation.org | +63 917 234 5678',
    },
    {
      name: 'Makati Corporate Donation Center',
      address: '789 Ayala Avenue, Makati City, Metro Manila',
      latitude: 14.5547,
      longitude: 121.0244,
      contactInfo: 'makati.center@foodonation.org | +63 917 345 6789',
    },
    {
      name: 'Pasig Community Kitchen',
      address: '321 Ortigas Avenue, Pasig City, Metro Manila',
      latitude: 14.5764,
      longitude: 121.0851,
      contactInfo: 'pasig.kitchen@foodonation.org | +63 917 456 7890',
    },
    {
      name: 'Taguig Donation Hub',
      address: '654 McKinley Road, Taguig City, Metro Manila',
      latitude: 14.5176,
      longitude: 121.0509,
      contactInfo: 'taguig.hub@foodonation.org | +63 917 567 8901',
    },
  ];

  const createdCenters = [];

  for (const center of donationCenters) {
    const existingPlace = await prisma.place.findFirst({
      where: { name: center.name },
    });

    if (existingPlace) {
      console.log(`   ℹ️  Donation center already exists: ${center.name}`);
      const existingCenter = await prisma.donationCenter.findUnique({
        where: { placeId: existingPlace.id },
      });
      if (existingCenter) {
        createdCenters.push(existingCenter);
      }
      continue;
    }

    const place = await prisma.place.create({
      data: {
        name: center.name,
        address: center.address,
        latitude: center.latitude,
        longitude: center.longitude,
      },
    });

    const donationCenter = await prisma.donationCenter.create({
      data: {
        contactInfo: center.contactInfo,
        placeId: place.id,
      },
      include: {
        place: true,
      },
    });

    createdCenters.push(donationCenter);
    console.log(`   ✅ Created donation center: ${center.name}`);
  }

  // ============================================
  // 4. SEED PROGRAM WITH STALLS (for donors)
  // ============================================
  console.log('\n📅 Seeding Program with Stall Capacity...');

  const programTitle = 'Community Market Day - Quezon City';
  let marketProgram = await prisma.program.findFirst({ where: { title: programTitle } });
  if (!marketProgram) {
    const qcPlace = await prisma.place.findFirst({ where: { name: 'Main Distribution Center - Quezon City' } });
    marketProgram = await prisma.program.create({
      data: {
        title: programTitle,
        description: 'Stall reservations for donors to sell goods at reduced price or donate directly.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxParticipants: 300,
        placeId: qcPlace?.id || (await prisma.place.create({
          data: {
            name: 'Temporary Market Venue',
            address: 'Commonwealth Ave, Quezon City',
            latitude: 14.6760,
            longitude: 121.0437,
          }
        })).id,
        stallCapacity: 10,
        reservedStalls: 0,
        status: 'SCHEDULED',
      }
    });
    console.log(`   ✅ Created program with stalls: ${marketProgram.title}`);
  } else {
    console.log(`   ℹ️  Program already exists: ${marketProgram.title}`);
  }

  console.log('\n🧩 Reserving sample stalls for donors...');
  // Link first three donors to stall reservations if not present
  for (const donor of createdDonors.slice(0, 3)) {
    if (!donor) continue;
    const existing = await prisma.stallReservation.findFirst({
      where: { programId: marketProgram.id, donorId: donor.id }
    });
    if (existing) {
      console.log(`   ℹ️  Reservation exists for donor: ${donor.displayName}`);
      continue;
    }
    try {
      const count = await prisma.stallReservation.count({ where: { programId: marketProgram.id } });
      const created = await prisma.stallReservation.create({
        data: {
          programId: marketProgram.id,
          donorId: donor.id,
          slotNumber: count + 1,
          status: 'APPROVED'
        }
      });
      await prisma.program.update({ where: { id: marketProgram.id }, data: { reservedStalls: { increment: 1 } } });
      console.log(`   ✅ Reserved stall #${created.slotNumber} for ${donor.displayName}`);
    } catch (e) {
      console.log(`   ⚠️  Could not reserve for ${donor.displayName}: ${(e as any).message}`);
    }
  }

  // ============================================
  // 5. SEED TEST BENEFICIARIES
  // ============================================
  console.log('\n👥 Seeding Test Beneficiaries...');

  const testBeneficiaries = [
    {
      email: 'maria.santos@test.com',
      password: 'TestPassword123!',
      status: 'APPROVED' as const,
      firstName: 'Maria',
      middleName: 'Cruz',
      lastName: 'Santos',
      age: 34,
      birthDate: new Date('1991-03-15'),
      gender: Gender.FEMALE,
      civilStatus: CivilStatus.MARRIED,
      occupation: 'Market Vendor',
      contactNumber: '+63 917 123 4567',
      primaryPhone: '+63 917 123 4567',
      householdNumber: 5,
      adultCount: 2,
      childrenCount: 3,
      seniorCount: 0,
      pwdCount: 0,
      householdAnnualSalary: 120000,
      monthlyIncome: 10000,
      householdPosition: HouseholdPosition.MOTHER,
      mainEmploymentStatus: MainEmploymentStatus.EMPLOYED_FULL_TIME,
      incomeSources: [IncomeSource.INFORMAL_GIG],
      receivingAid: false,
      specialDietRequired: false,
      declarationAccepted: true,
      privacyAccepted: true,
      address: {
        streetNumber: '123 Sampaguita St.',
        barangay: 'Barangay 176',
        municipality: 'Caloocan City',
        region: 'NCR',
        country: 'Philippines',
        zipCode: '1400',
      },
    },
    {
      email: 'juan.dela.cruz@test.com',
      password: 'TestPassword123!',
      status: 'APPROVED' as const,
      firstName: 'Juan',
      middleName: 'Reyes',
      lastName: 'Dela Cruz',
      age: 45,
      birthDate: new Date('1980-07-20'),
      gender: Gender.MALE,
      civilStatus: CivilStatus.MARRIED,
      occupation: 'Construction Worker',
      contactNumber: '+63 917 234 5678',
      primaryPhone: '+63 917 234 5678',
      householdNumber: 6,
      adultCount: 2,
      childrenCount: 3,
      seniorCount: 1,
      pwdCount: 0,
      householdAnnualSalary: 180000,
      monthlyIncome: 15000,
      householdPosition: HouseholdPosition.MOTHER,
      mainEmploymentStatus: MainEmploymentStatus.EMPLOYED_FULL_TIME,
      incomeSources: [IncomeSource.FORMAL_SALARIED],
      receivingAid: true,
      receivingAidDetail: 'Pantawid Pamilyang Pilipino Program (4Ps)',
      specialDietRequired: false,
      declarationAccepted: true,
      privacyAccepted: true,
      address: {
        streetNumber: '456 Maharlika Ave.',
        barangay: 'Barangay Addition Hills',
        municipality: 'Mandaluyong City',
        region: 'NCR',
        country: 'Philippines',
        zipCode: '1550',
      },
    },
    {
      email: 'rosa.garcia@test.com',
      password: 'TestPassword123!',
      status: 'PENDING' as const,
      firstName: 'Rosa',
      middleName: 'Lopez',
      lastName: 'Garcia',
      age: 28,
      birthDate: new Date('1997-05-12'),
      gender: Gender.FEMALE,
      civilStatus: CivilStatus.SINGLE,
      occupation: 'Housewife',
      contactNumber: '+63 917 345 6789',
      primaryPhone: '+63 917 345 6789',
      householdNumber: 4,
      adultCount: 2,
      childrenCount: 2,
      seniorCount: 0,
      pwdCount: 0,
      householdAnnualSalary: 96000,
      monthlyIncome: 8000,
      householdPosition: HouseholdPosition.MOTHER,
      mainEmploymentStatus: MainEmploymentStatus.LONG_TERM_UNEMPLOYED,
      incomeSources: [IncomeSource.GOV_ASSISTANCE],
      receivingAid: false,
      specialDietRequired: false,
      declarationAccepted: true,
      privacyAccepted: true,
      address: {
        streetNumber: '789 Rizal St.',
        barangay: 'Barangay Malanday',
        municipality: 'Valenzuela City',
        region: 'NCR',
        country: 'Philippines',
        zipCode: '1440',
      },
    },
    {
      email: 'pedro.ramos@test.com',
      password: 'TestPassword123!',
      status: 'PENDING' as const,
      firstName: 'Pedro',
      middleName: 'Santos',
      lastName: 'Ramos',
      age: 52,
      birthDate: new Date('1973-11-08'),
      gender: Gender.MALE,
      civilStatus: CivilStatus.WIDOWED,
      occupation: 'Tricycle Driver',
      contactNumber: '+63 917 456 7890',
      primaryPhone: '+63 917 456 7890',
      householdNumber: 4,
      adultCount: 2,
      childrenCount: 2,
      seniorCount: 0,
      pwdCount: 1,
      householdAnnualSalary: 108000,
      monthlyIncome: 9000,
      householdPosition: HouseholdPosition.FATHER,
      mainEmploymentStatus: MainEmploymentStatus.EMPLOYED_FULL_TIME,
      incomeSources: [IncomeSource.INFORMAL_GIG],
      receivingAid: false,
      specialDietRequired: true,
      specialDietDescription: 'One child requires gluten-free diet',
      declarationAccepted: true,
      privacyAccepted: true,
      address: {
        streetNumber: '321 Bonifacio St.',
        barangay: 'Barangay San Jose',
        municipality: 'Navotas City',
        region: 'NCR',
        country: 'Philippines',
        zipCode: '1485',
      },
    },
    {
      email: 'luisa.fernandez@test.com',
      password: 'TestPassword123!',
      status: 'REJECTED' as const,
      reviewReason: 'Annual household income exceeds eligibility threshold',
      reviewedAt: new Date('2024-12-10'),
      firstName: 'Luisa',
      middleName: 'Torres',
      lastName: 'Fernandez',
      age: 38,
      birthDate: new Date('1987-02-25'),
      gender: Gender.FEMALE,
      civilStatus: CivilStatus.MARRIED,
      occupation: 'Office Clerk',
      contactNumber: '+63 917 567 8901',
      primaryPhone: '+63 917 567 8901',
      householdNumber: 4,
      adultCount: 2,
      childrenCount: 2,
      seniorCount: 0,
      pwdCount: 0,
      householdAnnualSalary: 350000,
      monthlyIncome: 29000,
      householdPosition: HouseholdPosition.MOTHER,
      mainEmploymentStatus: MainEmploymentStatus.EMPLOYED_FULL_TIME,
      incomeSources: [IncomeSource.FORMAL_SALARIED],
      receivingAid: false,
      specialDietRequired: false,
      declarationAccepted: true,
      privacyAccepted: true,
      address: {
        streetNumber: '654 Luna St.',
        barangay: 'Barangay Bagong Silang',
        municipality: 'Quezon City',
        region: 'NCR',
        country: 'Philippines',
        zipCode: '1119',
      },
    },
    {
      email: 'antonio.reyes@test.com',
      password: 'TestPassword123!',
      status: 'REJECTED' as const,
      reviewReason: 'Incomplete documentation - missing government ID verification',
      reviewedAt: new Date('2024-12-12'),
      firstName: 'Antonio',
      middleName: 'Cruz',
      lastName: 'Reyes',
      age: 41,
      birthDate: new Date('1984-09-30'),
      gender: Gender.MALE,
      civilStatus: CivilStatus.MARRIED,
      occupation: 'Factory Worker',
      contactNumber: '+63 917 678 9012',
      primaryPhone: '+63 917 678 9012',
      householdNumber: 5,
      adultCount: 2,
      childrenCount: 3,
      seniorCount: 0,
      pwdCount: 0,
      householdAnnualSalary: 150000,
      monthlyIncome: 12500,
      householdPosition: HouseholdPosition.FATHER,
      mainEmploymentStatus: MainEmploymentStatus.EMPLOYED_FULL_TIME,
      incomeSources: [IncomeSource.FORMAL_SALARIED],
      receivingAid: false,
      specialDietRequired: false,
      declarationAccepted: true,
      privacyAccepted: true,
      address: {
        streetNumber: '987 Mabini St.',
        barangay: 'Barangay Sta. Cruz',
        municipality: 'Makati City',
        region: 'NCR',
        country: 'Philippines',
        zipCode: '1203',
      },
    },
  ];

  const createdBeneficiaries = [];

  for (const beneficiary of testBeneficiaries) {
    const existingUser = await prisma.user.findUnique({
      where: { email: beneficiary.email },
    });

    if (existingUser) {
      console.log(`   ℹ️  Beneficiary already exists: ${beneficiary.email}`);
      const existingBeneficiary = await prisma.beneficiary.findUnique({
        where: { userId: existingUser.id },
      });
      if (existingBeneficiary) {
        createdBeneficiaries.push(existingBeneficiary);
      }
      continue;
    }

    const hashedPassword = await bcrypt.hash(beneficiary.password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: beneficiary.email,
        password: hashedPassword,
        status: beneficiary.status,
        beneficiaryProfile: {
          create: {
            firstName: beneficiary.firstName,
            middleName: beneficiary.middleName,
            lastName: beneficiary.lastName,
            age: beneficiary.age,
            birthDate: beneficiary.birthDate,
            gender: beneficiary.gender,
            civilStatus: beneficiary.civilStatus,
            occupation: beneficiary.occupation,
            contactNumber: beneficiary.contactNumber,
            primaryPhone: beneficiary.primaryPhone,
            householdNumber: beneficiary.householdNumber,
            adultCount: beneficiary.adultCount,
            childrenCount: beneficiary.childrenCount,
            seniorCount: beneficiary.seniorCount,
            pwdCount: beneficiary.pwdCount,
            householdAnnualSalary: beneficiary.householdAnnualSalary,
            monthlyIncome: beneficiary.monthlyIncome,
            householdPosition: beneficiary.householdPosition,
            mainEmploymentStatus: beneficiary.mainEmploymentStatus,
            incomeSources: beneficiary.incomeSources,
            receivingAid: beneficiary.receivingAid,
            receivingAidDetail: beneficiary.receivingAidDetail,
            specialDietRequired: beneficiary.specialDietRequired,
            specialDietDescription: beneficiary.specialDietDescription,
            declarationAccepted: beneficiary.declarationAccepted,
            privacyAccepted: beneficiary.privacyAccepted,
            status: beneficiary.status,
            reviewReason: beneficiary.reviewReason,
            reviewedAt: beneficiary.reviewedAt,
            address: {
              create: beneficiary.address,
            },
          },
        },
      },
      include: {
        beneficiaryProfile: true,
      },
    });

    createdBeneficiaries.push(newUser.beneficiaryProfile!);
    console.log(`   ✅ Created beneficiary: ${beneficiary.firstName} ${beneficiary.lastName} (${beneficiary.status})`);
  }

  // ============================================
  // 5. SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('✨ SEED COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   - Admin Users: 1`);
  console.log(`   - Test Donors: ${createdDonors.length}`);
  console.log(`   - Donation Centers: ${createdCenters.length}`);
  console.log(`   - Test Beneficiaries: ${createdBeneficiaries.length}`);
  console.log(`   - Programs with stalls: 1`);
  
  const approvedCount = createdBeneficiaries.filter(b => b.status === 'APPROVED').length;
  const pendingCount = createdBeneficiaries.filter(b => b.status === 'PENDING').length;
  const rejectedCount = createdBeneficiaries.filter(b => b.status === 'REJECTED').length;
  console.log(`     • Approved: ${approvedCount}`);
  console.log(`     • Pending: ${pendingCount}`);
  console.log(`     • Rejected: ${rejectedCount}`);

  console.log('\n🔑 Test Credentials:');
  console.log('\n   Admin:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);

  console.log('\n   Test Donors (all use same password):');
  console.log(`   Password: TestPassword123!`);
  testDonors.forEach((donor) => {
    console.log(`   - ${donor.email}`);
  });

  console.log('\n   Sample Stall Reservations:');
  const stallList = await prisma.stallReservation.findMany({ where: { programId: marketProgram.id }, include: { donor: true } });
  stallList.forEach((r) => {
    console.log(`   - ${r.donor.displayName}: slot #${r.slotNumber} [${r.status}]`);
  });

  console.log('\n   Test Beneficiaries (all use same password):');
  console.log(`   Password: TestPassword123!`);
  testBeneficiaries.forEach((beneficiary) => {
    console.log(`   - ${beneficiary.email} [${beneficiary.status}]`);
  });

  console.log('\n🏢 Donation Centers:');
  donationCenters.forEach((center, index) => {
    console.log(`   ${index + 1}. ${center.name}`);
  });

  console.log('\n🚀 Next Steps:');
  console.log('   1. Run: node get-test-ids.mjs');
  console.log('   2. Copy the IDs to test-donations.http or test-donations.mjs');
  console.log('   3. Start testing: npm run dev');
  console.log('   4. Run tests: node test-donations.mjs');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
