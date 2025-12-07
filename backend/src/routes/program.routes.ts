import express from 'express';
import { getAllPrograms, getProgramById ,createProgram} from '../controllers/program.controller.js';
import { validateCreateProgram } from '../middleware/program.middleware.js';
const router = express.Router();

// Route to get all programs
router.get('/', getAllPrograms);

// Route to get a program by ID
router.get('/:id', getProgramById);

router.post('/addprogram',validateCreateProgram,createProgram);

export default router;