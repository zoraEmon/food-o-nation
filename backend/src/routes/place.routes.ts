import express from 'express';
import { getAllPlaces, getPlaceById ,createPlace,updatePlace,deletePlace} from '../controllers/place.controller.js';
import { validateCreatePlace } from '../middleware/place.middleware.js';
const router = express.Router();

// Route to get all programs
router.get('/', getAllPlaces);

// Route to get a program by ID
router.get('/:id', getPlaceById);

router.post('/addplace',validateCreatePlace,createPlace);
router.put('/updateplace/:id',updatePlace);
router.post('/deleteplace/:id',deletePlace)
export default router;