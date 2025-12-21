(async () => {
  try {
    const mod = await import('../generated/prisma/index.js');
    const { PrismaClient } = mod;
    const prisma = new PrismaClient();
    const qs = await prisma.question.findMany();
    console.log(qs.map(q => ({ id: q.id, text: q.text, type: q.type })));
    await prisma.$disconnect();
  } catch (err) {
    console.error('Failed to list questions', err);
    process.exit(1);
  }
})();
