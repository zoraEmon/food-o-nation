import { PrismaClient, DonorType, Gender, CivilStatus } from '@prisma/client';
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
  // 4. SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('✨ SEED COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   - Admin Users: 1`);
  console.log(`   - Test Donors: ${createdDonors.length}`);
  console.log(`   - Donation Centers: ${createdCenters.length}`);

  console.log('\n🔑 Test Credentials:');
  console.log('\n   Admin:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);

  console.log('\n   Test Donors (all use same password):');
  console.log(`   Password: TestPassword123!`);
  testDonors.forEach((donor) => {
    console.log(`   - ${donor.email}`);
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
