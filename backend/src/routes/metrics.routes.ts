import express from 'express';
import { getAppMetrics } from '../controllers/metrics.controller';

const router = express.Router();

// GET /api/metrics - Get application metrics
router.get('/', getAppMetrics);

export default router;
