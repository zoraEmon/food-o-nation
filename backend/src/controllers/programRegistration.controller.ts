import { Request, Response } from 'express';
import { createProgramRegistrationService, getAllProgramRegistrationsService,getProgramRegistrationByIdService,updateProgramRegistrationService,deleteProgramRegistrationService  } from '../services/programRegistration.service.js';
import { ProgramRegistrationData } from '../interfaces/interfaces.js';


export const createProgramRegistration = async (req: Request, res: Response) =>{
    try{
        console.log('Request Body:', req.body);
        const programRegistrationData: ProgramRegistrationData = req.body;
        const newProgramRegistration = await createProgramRegistrationService(programRegistrationData);
        res.status(201).json({success:true,data:newProgramRegistration});
    } catch(error:any){
        res.status(500).json({success:false,error:error.message})
    }
}
export const getAllProgramRegistrations = async (req: Request, res: Response) => {
    try {
        const programRegistrations = await getAllProgramRegistrationsService();
        res.status(200).json({ success: true, data: programRegistrations });
    } catch (error:any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getProgramRegistrationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const programRegistration = await getProgramRegistrationByIdService(id);

        if (!programRegistration) {
            return res.status(404).json({ success: false, error: 'Program not found' });
        }

        res.status(200).json({ success: true, data: programRegistration });
    } catch (error:any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateProgramRegistration = async (req: Request, res: Response) => {
    try{
        const programRegistrationId = req.params.id;
        const updateData: Partial<ProgramRegistrationData> = req.body;
        const updatedProgramRegistration = await updateProgramRegistrationService(programRegistrationId, updateData);
        if(!updatedProgramRegistration){
            return res.status(404).json({ success: false, error: 'Program not found' });
        }
        res.status(200).json({ success: true, data: updatedProgramRegistration });
    }
    catch(error:any){
        res.status(500).json({ success: false, error: error.message });
    }   
}
export const deleteProgramRegistration = async (req: Request, res: Response) => {
    try{
        const programRegistrationId = req.params.id;
        const deletedProgramRegistration = await deleteProgramRegistrationService(programRegistrationId);
        if(!deletedProgramRegistration){
            return res.status(404).json({ success: false, error: 'Program not found' });
        }
        res.status(200).json({ success: true, data: deletedProgramRegistration });
    }
    catch(error:any){
        res.status(500).json({ success: false, error: error.message });
    }
}