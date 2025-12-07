import { PrismaClient } from '@prisma/client';
import { ProgramData } from '../interfaces/interfaces.js';
import { da } from 'zod/locales';

const prisma = new PrismaClient();

// Service to get all programs
export const getAllProgramsService = async () => {
    return await prisma.program.findMany({
        include: {
            place: true, // Include related Place data
            donations: true, // Include related Donations
        },
    });
};

// Service to get a program by ID
export const getProgramByIdService = async (id: string) => {
    return await prisma.program.findUnique({
        where: { id },
        include: {
            place: true, // Include related Place data
            donations: true, // Include related Donations
            registrations: true, // Include related Registrations
        },
    });
};
export const createProgramService  = async (data:ProgramData)=>{
    try{
        const placeExists = await prisma.place.findUnique({
            where:{id: data.placeId},
        });
        if(!placeExists){
            throw new Error('Invalid placeId: Place does not exist');
        }
        const newProgram = await prisma.program.create({
            data:{
                title: data.title,
                description: data.description,
                date:new Date(data.date), // Convert string to Date object
                maxParticipants: parseInt(data.maxParticipants.toString()),
                placeId:data.placeId,
            },
        });
        return newProgram
    }catch(error){
        console.error('Error in createProgramService:', error);
        throw new Error('Failed to create program: ' + error);
    }
    // return await prisma.program.create({
    //     data:programData
    // })
}