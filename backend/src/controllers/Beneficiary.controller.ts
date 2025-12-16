import { Request, Response } from 'express';
import { getBeneficiaryByIdService, getAllBeneficiaryService, createBeneficiaryService, updateBeneficiaryService,deleteBeneficiaryService  } from '../services/beneficiary.service.js';
import { BeneficiaryData } from '../interfaces/interfaces.js';


export const createBeneficiary = async (req: Request, res: Response) => {
    try {
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);
        const beneficiaryData: BeneficiaryData = req.body;
        const newBeneficiary = await createBeneficiaryService(beneficiaryData);

        // Send success response
        res.status(201).json({ success: true, data: newBeneficiary });
    } catch (error: any) {
        // Send error response with error.message
        res.status(500).json({ success: false, error: error.message });
    }
};
export const getAllBeneficiary = async (req: Request, res: Response) => {
    try {
        const beneficiaries = await getAllBeneficiaryService();
        res.status(200).json({ success: true, data: beneficiaries });
    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
};

export const getBeneficiaryId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const beneficiary = await getBeneficiaryByIdService(id);

        if (!beneficiary) {
            return res.status(404).json({ success: false, error: 'Beneficiary not found' });
        }

        res.status(200).json({ success: true, data: beneficiary });
    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
};

export const updateBeneficiary = async (req: Request, res: Response) => {
    try{
        const beneficiaryId = req.params.id;
        const updateData: Partial<BeneficiaryData> = req.body;
        const updatedBeneficiary = await updateBeneficiaryService(beneficiaryId, updateData);
        if(!updatedBeneficiary){
            return res.status(404).json({ success: false, error: 'Beneficiary not found' });
        }
        res.status(200).json({ success: true, data: updatedBeneficiary });
    }
    catch(error:any){
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteBeneficiary = async (req: Request, res: Response) => {
    try{
        const beneficiaryId = req.params.id;
        const deletedBeneficiary = await deleteBeneficiaryService(beneficiaryId);
        if(!deletedBeneficiary){
            return res.status(404).json({ success: false, error: 'Beneficiary not found' });
        }
        res.status(200).json({ success: true, data: deletedBeneficiary });
    }
    catch(error:any){
        res.status(500).json({ success: false, error: error.message });
    }
}