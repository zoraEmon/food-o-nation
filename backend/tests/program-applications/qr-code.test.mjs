import assert from 'assert';
import { PrismaClient } from '../../generated/prisma/index.js';
// Use .ts extension so tsx can resolve the TypeScript source directly
import { createProgramApplicationService } from '../../src/services/programApplication.service.ts';

const prisma = new PrismaClient();

async function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function main() {
  let registration;
  let application;
  const cleanup = [];

  try {
    const program = await prisma.program.findFirst({ where: { title: 'Community Market Day - Quezon City' } });
    assert(program, 'Seed program not found; run `npm run seed` first.');

    const beneficiary = await prisma.beneficiary.findFirst({});
    assert(beneficiary, 'No beneficiary found; seed data required.');

    const beneficiaryUser = await prisma.user.findUnique({ where: { id: beneficiary.userId } });
    assert(beneficiaryUser, 'Beneficiary user not found.');

    registration = await prisma.programRegistration.create({
      data: {
        programId: program.id,
        beneficiaryId: beneficiary.id,
        status: 'PENDING',
      },
    });
    cleanup.push(() => prisma.programRegistration.delete({ where: { id: registration.id } }));
    log('Created test program registration');

    application = await createProgramApplicationService(
      registration.id,
      beneficiary.activeEmail || beneficiaryUser.email,
      `${beneficiary.firstName} ${beneficiary.lastName}`,
      program.title,
      program.date
    );
    cleanup.push(() => prisma.programApplication.delete({ where: { id: application.id } }));
    log('Created program application via service');

    assert(application.qrCodeValue && application.qrCodeValue.length > 10, 'QR code value should be generated');
    assert(application.qrCodeImageUrl && application.qrCodeImageUrl.startsWith('data:image/png;base64'), 'QR code image should be a data URL');
    assert.strictEqual(application.programRegistrationId, registration.id, 'Application should link to registration');

    log('All assertions passed: QR code generated and linked.');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exitCode = 1;
  } finally {
    for (const action of cleanup.reverse()) {
      try {
        await action();
      } catch (e) {
        console.warn('Cleanup warning:', e.message);
      }
    }
    await prisma.$disconnect();
  }
}

if (import.meta.vitest) {
  describe('QR code (E2E) - skipped under unit test runner', () => { it('is skipped in unit test runs', () => {}); });
} else {
  main();
}
