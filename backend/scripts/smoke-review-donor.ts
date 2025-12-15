import { DonorService } from '../src/services/donor.service.js';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();
const donorService = new DonorService();

async function main() {
  const id = process.env.DONOR_ID || process.argv[2] || '';
  const approveArg = process.env.APPROVE || process.argv[3] || 'true';
  const approved = approveArg === 'true';

  if (!id) {
    console.error('Usage: tsx scripts/smoke-review-donor.ts <DONOR_ID> [true|false]');
    process.exit(1);
  }

  const before = await prisma.donor.findUnique({
    where: { id },
    include: { user: { select: { email: true, status: true } } },
  });
  console.log('Before:', before?.user?.email, before?.user?.status, before?.status);

  const updated = await donorService.reviewDonor(id, { approved, reason: approved ? 'Smoke test approval' : 'Smoke test rejection' });
  console.log('After: ', updated.user?.email, updated.user?.status, updated.status);
}

main()
  .catch((e) => {
    console.error('Smoke test failed:', e?.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
