import { Request, Response } from 'express';
import { getDonorByIdService, getAllDonorService,createDonorService,updateDonorService ,deleteDonorService } from '../services/donor.service.js';
import { DonorData } from '../interfaces/interfaces.js';


export const createDonor = async (req: Request, res: Response) => {
    try {
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);
        // Extract and validate the request body
        const donorData: DonorData = req.body;

        // Call the service to create the place
        const newDonor = await createDonorService(donorData);

        // Send success response
        res.status(201).json({ success: true, data: newDonor });
    } catch (error: any) {
        // Send error response with error.message
        res.status(500).json({ success: false, error: error.message });
    }
};
export const getAllDonors = async (req: Request, res: Response) => {
    try {
        const beneficiary = await getAllDonorService();
        res.status(200).json({ success: true, data: beneficiary });
    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
};

export const getDonorById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const donor = await getDonorByIdService(id);

        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }

        res.status(200).json({ success: true, data: donor });
    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
};

export const updateDonor = async (req: Request, res: Response) => {
    try{
        const donorId = req.params.id;
        const updateData: Partial<DonorData> = req.body;
        const updatedDonor = await updateDonorService(donorId, updateData);
        if(!updatedDonor){
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }   
        res.status(200).json({ success: true, data: updatedDonor });
    }
    catch(error){
        res.status(500).json({ success: false, error: error.message });
    }
};
export const deleteDonor = async (req: Request, res: Response) => {
    try{
        const donorId = req.params.id;
        const deletedDonor = await deleteDonorService(donorId);
        if(!deletedDonor){
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }
        res.status(200).json({ success: true, data: deletedDonor });
    }
    catch(error){
        res.status(500).json({ success: false, error: error.message });
    }
}