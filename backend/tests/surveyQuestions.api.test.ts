// Enable fast static questions and in-memory mock before importing application code
process.env.TEST_USE_MEMORY = 'true';
process.env.USE_STATIC_QUESTIONS = 'true';

import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import questionRouter from '../src/controllers/question.controller.js';
import { SURVEY_OPTIONS } from '../src/constants/surveyOptions';

describe('GET /api/survey-questions (integration)', () => {
  it('returns questions with options matching SURVEY_OPTIONS', async () => {
    const app = express();
    app.use('/api', questionRouter);

    const res = await request(app).get('/api/survey-questions').expect(200);
    expect(res.body).toHaveProperty('questions');
    const questions = res.body.questions;
    expect(Array.isArray(questions)).toBe(true);

    for (const q of questions) {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('text');
      expect(q).toHaveProperty('type');
      const expected = SURVEY_OPTIONS[q.type] || [];
      expect(q.options).toEqual(expected);
    }
  });
});
