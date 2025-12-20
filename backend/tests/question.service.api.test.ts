import { describe, it, expect } from 'vitest';
import { getAllSurveyQuestionsService } from '../src/services/question.service';
import { SURVEY_OPTIONS } from '../src/constants/surveyOptions';

describe('getAllSurveyQuestionsService', () => {
  it('returns questions with options that match SURVEY_OPTIONS', async () => {
    const questions = await getAllSurveyQuestionsService();
    expect(Array.isArray(questions)).toBe(true);
    for (const q of questions) {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('text');
      expect(q).toHaveProperty('type');
      // options should be provided
      const expected = SURVEY_OPTIONS[q.type] || [];
      expect(q.options).toBeDefined();
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options).toEqual(expected);
    }
  });
});
