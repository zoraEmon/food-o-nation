import { PrismaClient } from '../../generated/prisma/index.js';
import PrismaMock from '../memory/prismaMock.js';
import { ProgramData } from '../interfaces/interfaces.js';
import { da } from 'zod/locales';

const prisma: any = process.env.TEST_USE_MEMORY === 'true' ? new PrismaMock() : new PrismaClient();
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

function validateDate(date: string | Date): Date {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date format.');
  }
  return dateObj;
}

function validateMaxParticipants(value: number | string): number {
  const parsed = Number(value);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error('maxParticipants must be a valid positive number');
  }
  return parsed;
}

export const updateProgramService = async (
  programId: string,
  updateData: Partial<ProgramData>
) => {
  try {
    if (updateData.placeId) {
      const placeExists = await prisma.place.findUnique({
        where: { id: updateData.placeId },
      });
      if (!placeExists) {
        throw new Error('Invalid placeId: Place does not exist');
      }
    }

    const result = await prisma.program.update({
      where: { id: programId },
      data: {
        ...updateData,
        date: updateData.date ? validateDate(updateData.date) : undefined,
        maxParticipants: updateData.maxParticipants !== undefined
          ? validateMaxParticipants(updateData.maxParticipants)
          : undefined,
      },
    });

    return result;
  } catch (error: any) {
    console.error('Error in updateProgramService:', error);

    if (error.code === 'P2025') {
      throw new Error(`Program with id ${programId} not found.`);
    }

    throw new Error('Failed to update program: ' + error.message);
  }
};