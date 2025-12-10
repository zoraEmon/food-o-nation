import { Request, Response } from 'express';
import { getAllProgramsService, getProgramByIdService,createProgramService,updateProgramService,deleteProgramService  } from '../services/program.service.js';
import { ProgramData } from '../interfaces/interfaces.js';


export const createProgram = async (req: Request, res: Response) =>{
    try{
        console.log('Request Body:', req.body);
        const programData: ProgramData = req.body;
        const newProgram = await createProgramService(programData);
        res.status(201).json({success:true,data:newProgram});
    } catch(error){
        res.status(500).json({success:false,error:error.message})
    }
}
export const getAllPrograms = async (req: Request, res: Response) => {
    try {
        const programs = await getAllProgramsService();
        res.status(200).json({ success: true, data: programs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getProgramById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const program = await getProgramByIdService(id);

        if (!program) {
            return res.status(404).json({ success: false, error: 'Program not found' });
        }

        res.status(200).json({ success: true, data: program });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateProgram = async (req: Request, res: Response) => {
    try{
        const programId = req.params.id;
        const updateData: Partial<ProgramData> = req.body;
        const updatedProgram = await updateProgramService(programId, updateData);
        if(!updatedProgram){
            return res.status(404).json({ success: false, error: 'Program not found' });
        }
        res.status(200).json({ success: true, data: updatedProgram });
    }
    catch(error){
        res.status(500).json({ success: false, error: error.message });
    }   
}
export const deleteProgram = async (req: Request, res: Response) => {
    try{
        const programId = req.params.id;
        const deletedProgram = await deleteProgramService(programId);
        if(!deletedProgram){
            return res.status(404).json({ success: false, error: 'Program not found' });
        }
        res.status(200).json({ success: true, data: deletedProgram });
    }
    catch(error){
        res.status(500).json({ success: false, error: error.message });
    }
}