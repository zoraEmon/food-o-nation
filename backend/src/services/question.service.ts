import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';
import { SURVEY_OPTIONS } from '../constants/surveyOptions.js';
import { STATIC_SURVEY_QUESTIONS } from '../constants/surveyQuestions.js';

let _prismaInstance: any = null;
function getPrisma() {
  if (!_prismaInstance) {
    _prismaInstance = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();
  }
  return _prismaInstance;
}

// In-memory cache to speed up repeated reads during tests/runtime.
let _cachedQuestions: Array<any> | null = null;
let _cacheTimestamp = 0;
const CACHE_TTL = Number(process.env.QUESTION_CACHE_TTL_MS || (process.env.TEST_USE_MEMORY === 'true' ? 60000 : 2000)); // ms

export const clearQuestionCache = () => {
  _cachedQuestions = null;
  _cacheTimestamp = 0;
};

export const getAllSurveyQuestionsService = async () => {
  const now = Date.now();
  if (_cachedQuestions && now - _cacheTimestamp < CACHE_TTL) {
    return _cachedQuestions;
  }

  // In test or when static questions are preferred, return the static constant immediately
  if (process.env.TEST_USE_MEMORY === 'true' || process.env.USE_STATIC_QUESTIONS === 'true') {
    const mapped = STATIC_SURVEY_QUESTIONS.map((q: any) => ({ ...q, options: SURVEY_OPTIONS[q.type] || [] }));
    _cachedQuestions = mapped;
    _cacheTimestamp = now;
    return mapped;
  }

  const prisma = getPrisma();

  // Fetch minimal fields required for the API
  const questions = await prisma.question.findMany({
    select: { id: true, text: true, type: true },
    orderBy: { createdAt: 'asc' },
  });

  const mapped = questions.map((q: any) => ({
    ...q,
    options: SURVEY_OPTIONS[q.type] || [],
  }));

  _cachedQuestions = mapped;
  _cacheTimestamp = now;
  return mapped;
};

// Pre-warm cache in test/memory mode to avoid first-request latency during tests
if (process.env.TEST_USE_MEMORY === 'true' || process.env.NODE_ENV === 'test') {
  // fire-and-forget
  getAllSurveyQuestionsService().catch(() => {});
}
