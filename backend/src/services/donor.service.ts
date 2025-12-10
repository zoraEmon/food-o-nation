import { PrismaClient } from '@prisma/client';
import { DonorData } from '../interfaces/interfaces.js';
import { da } from 'zod/locales';

import { Prisma } from '@prisma/client';
const prisma = new PrismaClient();

// Service to get all programs
export const getAllDonorService = async () => {
    return await prisma.donor.findMany({
        include: {
            donations: true, // Include related donationCenter data
            user: true, // Include related programs
        },
    });
};

// Service to get a program by ID
export const getDonorByIdService = async (id: string) => {
    return await prisma.donor.findUnique({
        where: { id },
        include: {
            donations: true, // Include related donationCenter data
            user: true, // Include related programs
        },
    });
};
export const createDonorService  = async (data:DonorData)=>{
    try{
        const newPlace = await prisma.donor.create({
            data:{
                displayName: data.displayName,
                donorType: data.donorType,
                totalDonation: parseFloat(data.totalDonation.toString()),
                points: parseInt(data.points.toString()),
                userId: data.userId
            },
        });
        return newPlace
    }catch(error){
        console.error('Error in createDonorService:', error.message);
        throw new Error('Failed to create donor: ' + error.message);
    }
}

function validatePositiveNumber(value: number | string): number {
    const parsed = Number(value);
    if (isNaN(parsed) || parsed < 0) {
      throw new Error('maxParticipants must be a valid positive number');
    }
    return parsed;
  }
export const updateDonorService = async (
  donorId: string,
  updateData: Partial<DonorData>
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

    const result = await prisma.donor.update({
      where: { id: donorId },
      data: {
        ...updateData,
        totalDonation: updateData.totalDonation !== undefined
          ? validatePositiveNumber(updateData.totalDonation) : undefined,
          points: updateData.points !== undefined ? validatePositiveNumber(updateData.points) : undefined,
      },
    });
    return result;
  } catch (error: any) {
    console.error('Error in updateDonorService:', error);

    if (error.code === 'P2025') {
      throw new Error(`Donor with id ${donorId} not found.`);
    }

    throw new Error('Failed to update donor: ' + error.message);
  }
};

export const deleteDonorService = async (donorId: string) => {
  try {
    const deletedDonor = await prisma.donor.delete({
      where: { id: donorId },
    });

    return deletedDonor;
  } catch (error: any) {
    console.error('Error in deleteDonorService:', error);

    if (error.code === 'P2025') {
      throw new Error(`Donor with id ${donorId} not found.`);
    }

    throw new Error('Failed to delete donor: ' + error.message);
  }
}