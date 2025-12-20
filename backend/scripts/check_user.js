import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

(async () => {
  const email = 'cli2+test@example.com';
  try {
    const user = await prisma.user.findUnique({ where: { email }, include: { beneficiaryProfile: { include: { householdMembers: true, address: true } } } });
    console.log(JSON.stringify(user, null, 2));
  } catch (e) {
    console.error('Query failed', e);
  } finally {
    await prisma.$disconnect();
  }
})();
