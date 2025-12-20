import { PrismaClient } from '../../generated/prisma/index.js';
import { SURVEY_OPTIONS } from '../constants/surveyOptions.js';
const prisma = new PrismaClient();

export const getAllSurveyQuestionsService = async () => {
  // Fetch all questions for the food security survey
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      text: true,
      type: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Map each question type to its canonical options

  return questions.map(q => ({
    ...q,
    options: SURVEY_OPTIONS[q.type] || [],
  }));
};
