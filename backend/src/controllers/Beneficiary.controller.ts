import { Request, Response } from 'express';
import { getBeneficiaryByIdService, getAllBeneficiaryService,createBeneficiaryervice,updateBeneficiaryService  } from '../services/beneficiary.service.js';
import { BeneficiaryData } from '../interfaces/interfaces.js';


export const createBeneficiary = async (req: Request, res: Response) => {
    try {
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);
        // Extract and validate the request body
        const beneficiaryData: BeneficiaryData = req.body;

        // Call the service to create the place
        const newBeneficiary = await createBeneficiaryervice(beneficiaryData);

        // Send success response
        res.status(201).json({ success: true, data: newBeneficiary });
    } catch (error: any) {
        // Send error response with error.message
        res.status(500).json({ success: false, error: error.message });
    }
};
export const getAllBeneficiary = async (req: Request, res: Response) => {
    try {
        const Places = await getAllBeneficiaryService();
        res.status(200).json({ success: true, data: Places });
    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
};

export const getBeneficiaryId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const place = await getBeneficiaryByIdService(id);

        if (!place) {
            return res.status(404).json({ success: false, error: 'Place not found' });
        }

        res.status(200).json({ success: true, data: place });
    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
};

export const updateBeneficiary = async (req: Request, res: Response) => {
    try{
        const placeId = req.params.id;
        const updateData: Partial<BeneficiaryData> = req.body;
        const updatedPlace = await updateBeneficiaryService(placeId, updateData);
        if(!updatedPlace){
            return res.status(404).json({ success: false, error: 'Place not found' });
        }   
        res.status(200).json({ success: true, data: updatedPlace });
    }
    catch(error){
        res.status(500).json({ success: false, error: error.message });
    }
};