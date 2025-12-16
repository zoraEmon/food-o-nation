import { PrismaClient } from '@prisma/client';
import { ProgramRegistrationData } from '../interfaces/interfaces.js';
import { da } from 'zod/locales';

const prisma = new PrismaClient();
// Service to get all programs
export const getAllProgramRegistrationsService = async () => {
    return await prisma.programRegistration.findMany({
        include: {
            program: true, 
            beneficiary: true,
        },
    });
};

// Service to get a program by ID
export const getProgramRegistrationByIdService = async (id: string) => {
    return await prisma.programRegistration.findUnique({
        where: { id },
        include: {
            program: true, 
            beneficiary: true, 
        },
    });
};
export const createProgramRegistrationService  = async (data:ProgramRegistrationData)=>{
    try{
        const programExists = await prisma.program.findUnique({
            where:{id: data.programId},
        });
        if(!programExists){
            throw new Error('Invalid programId: Program does not exist');
        }
        const beneficiaryExists = await prisma.beneficiary.findUnique({
            where:{id: data.beneficiaryId},
        });
        if(!beneficiaryExists){
            throw new Error('Invalid beneficiaryId: Beneficiary does not exist');
        }
        const newProgramRegistration = await prisma.programRegistration.create({
            data:{
                status: data.status,
                registeredAt:new Date(),
                programId: data.programId,
                beneficiaryId:data.beneficiaryId,
            },
        });
        return newProgramRegistration
    }catch(error){
        console.error('Error in createProgramRegistrationService:', error);
        throw new Error('Failed to create programRegistration: ' + error);
    }
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

export const updateProgramRegistrationService = async (
  programRegistrationId: string,
  updateData: Partial<ProgramRegistrationData>
) => {
  try {
    if (updateData.programId) {
      const programExists = await prisma.program.findUnique({
        where: { id: updateData.programId },
      });
      if (!programExists) {
        throw new Error('Invalid programId: Program does not exist');
      }
    }
    if (updateData.beneficiaryId) {
      const beneficiaryExists = await prisma.beneficiary.findUnique({
        where: { id: updateData.beneficiaryId },
      });
      if (!beneficiaryExists) {
        throw new Error('Invalid beneficiaryId: Beneficiary does not exist');
      }
    }

    const result = await prisma.programRegistration.update({
      where: { id: programRegistrationId },
      data: {
        ...updateData,
        // date: updateData.date ? validateDate(updateData.date) : undefined,
      },
    });

    return result;
  } catch (error: any) {
    console.error('Error in updateProgramRegistration:', error);

    if (error.code === 'P2025') {
      throw new Error(`ProgramRegistration with id ${programRegistrationId} not found.`);
    }

    throw new Error('Failed to update programRegistration: ' + error.message);
  }
};

export const deleteProgramRegistrationService = async (programRegistrationId: string) => {
  try {
    const result = await prisma.programRegistration.delete({
      where: { id: programRegistrationId },
    });

    return result;
  } catch (error: any) {
    console.error('Error in deleteProgramRegistration:', error);

    if (error.code === 'P2025') {
      throw new Error(`ProgramRegistration with id ${programRegistrationId} not found.`);
    }

    throw new Error('Failed to delete programRegistration: ' + error.message);
  }
}