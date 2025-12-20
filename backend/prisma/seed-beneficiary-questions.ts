// Prisma seed script for beneficiary interview questions
import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

// All questions must only have food severity and frequency as answers
const questions = [
  { text: 'We are worried that the household would not have enough food to eat.', type: 'FOOD_SECURITY_SEVERITY' },
  { text: 'An adult member had to eat a smaller portion than they felt necessary because there wasn\'t enough food.', type: 'FOOD_SECURITY_SEVERITY' },
  { text: 'We had to rely on just a few kinds of low-cost food (or monotonous food) to feed the household.', type: 'FOOD_FREQUENCY' },
  { text: 'An adult member had to skip entire meals because there wasn\'t enough money or food.', type: 'FOOD_FREQUENCY' },
  { text: 'There was never any food to eat of any kind in our household because of a lack of resources.', type: 'FOOD_SECURITY_SEVERITY' },
  { text: 'A child in the household was not eating enough because we could not afford more food.', type: 'FOOD_SECURITY_SEVERITY' },
];

async function main() {
  for (const q of questions) {
    const exists = await prisma.question.findFirst({ where: { text: q.text } });
    if (!exists) {
      await prisma.question.create({ data: { text: q.text, type: q.type } });
    }
  }
  console.log('Beneficiary interview questions seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
