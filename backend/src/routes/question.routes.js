import express from 'express';
import questionController from '../controllers/question.controller.js';

const router = express.Router();

router.use('/', questionController);

export default router;
