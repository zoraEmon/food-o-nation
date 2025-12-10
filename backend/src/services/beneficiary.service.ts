import { PrismaClient } from '@prisma/client';
import { BeneficiaryData } from '../interfaces/interfaces.js';
import { da } from 'zod/locales';

const prisma = new PrismaClient();
// Service to get all programs
export const getAllBeneficiaryService = async () => {
    return await prisma.beneficiary.findMany({
        include: {
            user: true, 
            address: true, 
            programRegistrations: true, 
        },
    });
};

// Service to get a program by ID
export const getBeneficiaryByIdService = async (id: string) => {
    return await prisma.beneficiary.findUnique({
        where: { id },
        include: {
            user: true, 
            address: true, 
            programRegistrations: true, 
        },
    });
};
export const createBeneficiaryervice  = async (data:BeneficiaryData)=>{
    try{
        const userExists = await prisma.user.findUnique({
            where:{id: data.userId},
        });
        if(!userExists){
            throw new Error('Invalid userId: User does not exist');
        }
        const newBeneficiary = await prisma.beneficiary.create({
            data:{
              firstName: data.firstName,
              lastName: data.lastName,
              middleName: data.middleName,
              birthDate: new Date(data.birthDate),
              gender: data.gender,
              contactNumber: data.contactNumber,
              age: parseInt(data.age.toString()),
              civilStatus: data.civilStatus,
              occupation: data.occupation,
              householdNumber: parseInt(data.householdNumber.toString()),
              householdAnnualSalary:parseFloat(data.householdAnnualSalary.toString()),
              userId: data.userId,

                // date:new Date(data.date),
                // maxParticipants: parseInt(data.maxParticipants.toString()),
                // placeId:data.placeId,
            },
        });
        return newBeneficiary
    }catch(error){
        console.error('Error in createBeneficiaryervice:', error);
        throw new Error('Failed to create beneficiary: ' + error);
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

function validatePositiveNumber(value: number | string): number {
  const parsed = Number(value);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error('maxParticipants must be a valid positive number');
  }
  return parsed;
}

export const updateBeneficiaryService = async (
  beneficiaryId: string,
  updateData: Partial<BeneficiaryData>
) => {
  try {
    if (updateData.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: updateData.userId },
      });
      if (!userExists) {
        throw new Error('Invalid userId: User does not exist');
      }
    }

    const result = await prisma.beneficiary.update({
      where: { id: beneficiaryId },
      data: {
        ...updateData,
        birthDate: updateData.birthDate ? validateDate(updateData.birthDate) : undefined,
        householdNumber: updateData.householdNumber !== undefined
          ? validatePositiveNumber(updateData.householdNumber) : undefined,
          age: updateData.age !== undefined ? validatePositiveNumber(updateData.age) : undefined,
          householdAnnualSalary: updateData.householdAnnualSalary !== undefined? validatePositiveNumber(updateData.householdAnnualSalary) : undefined,
      },
    });

    return result;
  } catch (error: any) {
    console.error('Error in updateBeneficiaryService:', error);

    if (error.code === 'P2025') {
      throw new Error(`Beneficiary with id ${beneficiaryId} not found.`);
    }

    throw new Error('Failed to update beneficiary: ' + error.message);
  }
};

export const deleteBeneficiaryService = async (beneficiaryId: string) => {
  try {
    const result = await prisma.beneficiary.delete({
      where: { id: beneficiaryId },
    });

    return result;
  } catch (error: any) {
    console.error('Error in deleteBeneficiaryService:', error);

    if (error.code === 'P2025') {
      throw new Error(`Beneficiary with id ${beneficiaryId} not found.`);
    }   throw new Error('Failed to delete beneficiary: ' + error.message);
  }
}