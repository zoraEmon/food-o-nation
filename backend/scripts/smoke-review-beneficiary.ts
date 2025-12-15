import { reviewBeneficiaryService } from '../src/services/beneficiary.service.js';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  const id = process.env.BENEFICIARY_ID || process.argv[2] || '';
  const approveArg = process.env.APPROVE || process.argv[3] || 'true';
  const approved = approveArg === 'true';

  if (!id) {
    console.error('Usage: tsx scripts/smoke-review-beneficiary.ts <BENEFICIARY_ID> [true|false]');
    process.exit(1);
  }

  const before = await prisma.beneficiary.findUnique({
    where: { id },
    include: { user: { select: { email: true, status: true } } },
  });
  console.log('Before:', before?.user?.email, before?.user?.status, before?.status);

  const updated = await reviewBeneficiaryService(id, approved, approved ? 'Smoke test approval' : 'Smoke test rejection');

  const after = await prisma.user.findUnique({ where: { id: updated.userId } });
  console.log('After: ', after?.email, after?.status, updated.status);
}

main()
  .catch((e) => {
    console.error('Smoke test failed:', e?.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
