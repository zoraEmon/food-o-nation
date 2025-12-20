require('dotenv/config');
const { PrismaClient, DonorType, Gender, CivilStatus, HouseholdPosition, MainEmploymentStatus, IncomeSource } = require('@prisma/client');
const bcrypt = require('bcryptjs');
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

  // ...copy the rest of your seed logic from seed.ts here...
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
