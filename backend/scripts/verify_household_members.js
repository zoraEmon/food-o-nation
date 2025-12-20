import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

(async () => {
  const userId = process.argv[2] || '2e0ec2ec-a70e-4867-8b4b-2a6f60565c85';
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        beneficiaryProfile: {
          include: {
            householdMembers: true,
            address: true,
          }
        }
      }
    });

    if (!user) {
      console.log(`No user found with id ${userId}`);
    } else {
      console.log(JSON.stringify(user.beneficiaryProfile?.householdMembers || [], null, 2));
    }
  } catch (e) {
    console.error('Query failed', e);
  } finally {
    await prisma.$disconnect();
  }
})();