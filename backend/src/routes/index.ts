import express from 'express';
import authRoutes from './auth.routes.js';
import programRoutes from './program.routes.js';
import placeoutes from './place.routes.js';
// ruta for auth related endpoints [29/11/2025]
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/programs', programRoutes);
router.use('/place', placeoutes);
export default router;