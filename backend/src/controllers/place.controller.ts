import { Request, Response } from 'express';
import { getPlaceByIdService, getAllPlacesService,createPlaceService,updatePlaceService  } from '../services/place.service.js';
import { PlaceData } from '../interfaces/interfaces.js';


export const createPlace = async (req: Request, res: Response) => {
    try {
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);
        // Extract and validate the request body
        const placeData: PlaceData = req.body;

        // Call the service to create the place
        const newPlace = await createPlaceService(placeData);

        // Send success response
        res.status(201).json({ success: true, data: newPlace });
    } catch (error: any) {
        // Send error response with error.message
        res.status(500).json({ success: false, error: error.message });
    }
};
export const getAllPlaces = async (req: Request, res: Response) => {
    try {
        const Places = await getAllPlacesService();
        res.status(200).json({ success: true, data: Places });
    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
};

export const getPlaceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const place = await getPlaceByIdService(id);

        if (!place) {
            return res.status(404).json({ success: false, error: 'Place not found' });
        }

        res.status(200).json({ success: true, data: place });
    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
};

export const updatePlace = async (req: Request, res: Response) => {
    try{
        const placeId = req.params.id;
        const updateData: Partial<PlaceData> = req.body;
        const updatedPlace = await updatePlaceService(placeId, updateData);
        if(!updatedPlace){
            return res.status(404).json({ success: false, error: 'Place not found' });
        }   
        res.status(200).json({ success: true, data: updatedPlace });
    }
    catch(error){
        res.status(500).json({ success: false, error: error.message });
    }
};