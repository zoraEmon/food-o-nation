import express from 'express';
import { getAllPrograms, getProgramById ,createProgram,deleteProgram,updateProgram} from '../controllers/program.controller.js';
import { validateCreateProgram } from '../middleware/program.middleware.js';
const router = express.Router();

// Route to get all programs
router.get('/', getAllPrograms);

// Route to get a program by ID
router.get('/:id', getProgramById);

router.post('/addprogram',validateCreateProgram,createProgram);
router.post('/updateprogram/:id',updateProgram);
router.post('/deleteprogram/:id',deleteProgram);
export default router;