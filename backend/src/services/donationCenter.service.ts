import { PrismaClient } from '../../generated/prisma/index.js';
import { DonationCenterData } from "src/interfaces/interfaces.js";
import { ca } from "zod/locales";

const prisma = new PrismaClient();

export const createDonationCenterService = async (data: DonationCenterData) => {
    try {
        const placeExists = await prisma.place.findUnique({
            where: { id: data.placeId },
        });
        if (!placeExists) {
            throw new Error('Invalid placeId: Place does not exist');
        }
        const donationCenterExists = await prisma.donationCenter.findUnique({
            where: { placeId: data.placeId },
        });
        if (donationCenterExists) {
            throw new Error('Donation center already exists for this place');
        }
        const newDonationCenter = await prisma.donationCenter.create({
            data: {
                contactInfo: data.contactInfo,
                placeId: data.placeId,
            },
        });
        return newDonationCenter
    }
    catch (error) {
        console.error('Error in createDonationCenterService:', error);
        throw new Error('Failed to create donationCenter: ' + error);
    }
}
export const getAllDonationCentersService = async () => {
    return await prisma.donationCenter.findMany({
        include: {
            place: true,
            donations: true,
        },
    });
};

export const getDonationCenterByIdService = async (id: string) => {
    return await prisma.donationCenter.findUnique({
        where: { id },
        include: {
            place: true,
            donations: true,
        },
    });
};

export const deleteDonationCenterService = async (id: string) => {
  try {
    const deletedDonationCenter = await prisma.donationCenter.delete({
      where: { id: id },
    });

    return deletedDonationCenter;
  } catch (error: any) {
    console.error('Error in deleteDonationCenterService:', error);

    if (error.code === 'P2025') {
      throw new Error(`DonationCenter  with id ${id} not found.`);
    }

    throw new Error('Failed to delete DonationCenter : ' + error.message);
  }
}
export const updateDonationCenterService = async (id: string, data: Partial<DonationCenterData>) => {
    try {
        const updatedDonationCenter = await prisma.donationCenter.update({
            where: { id },
            data: {
                contactInfo: data.contactInfo,
                placeId: data.placeId,
            },
        });
        return updatedDonationCenter;
    } catch (error) {
        console.error('Error in updateDonationCenterService:', error);
        throw new Error('Failed to update DonationCenter: ' + error);
    }
}