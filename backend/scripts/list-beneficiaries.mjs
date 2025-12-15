import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

(async () => {
  try {
    const items = await prisma.beneficiary.findMany({
      take: 5,
      include: { user: { select: { id: true, email: true, status: true } } }
    });

    if (!items.length) {
      console.log('No beneficiaries found.');
    } else {
      for (const b of items) {
        console.log('Beneficiary:', b.id, b.firstName, b.lastName, '| User:', b.user?.email, b.user?.status);
      }
    }
  } catch (e) {
    console.error('Error listing beneficiaries:', e.message || e);
  } finally {
    await prisma.$disconnect();
  }
})();
