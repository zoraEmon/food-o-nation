import { getAllSurveyQuestionsService } from '../services/question.service.js';
import express from 'express';

const router = express.Router();

router.get('/survey-questions', async (req, res) => {
  try {
    const questions = await getAllSurveyQuestionsService();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch survey questions' });
  }
});

export default router;
