import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@foodonation.org';
  const adminPassword = 'secureAdmin123!';

  // Check if admin user already exists
  const existingAdminUser = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingAdminUser) {
    console.log('Admin user already exists. Skipping seed.');
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create the User and Admin records
  const adminUser = await prisma.user.create({
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

  console.log(`Created admin user with ID: ${adminUser.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
