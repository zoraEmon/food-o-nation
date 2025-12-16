import { PrismaClient } from '@prisma/client';
import { AddressData } from '../interfaces/interfaces.js';

const prisma = new PrismaClient();

// Service to get all programs
export const getAllAddressesService = async () => {
    return await prisma.address.findMany({
        include: {
            beneficiary: true, // Include related beneficiary data
        },
    });
};

// Service to get a program by ID
export const getAddressByIdService = async (id: string) => {
    return await prisma.address.findUnique({
        where: { id },
        include: {
            beneficiary: true, // Include related beneficiary data
        },
    });
};
export const createAddressService = async (data: AddressData) => {
    try {
        const newAddress = await prisma.address.create({
            data: {
                streetNumber: data.streetNumber,
                barangay: data.barangay,
                municipality: data.municipality,
                region: data.region,
                country: data.country,
                zipCode: data.zipCode,
                beneficiaryId: data.beneficiaryId,
            },
        });
        return newAddress
    } catch (error: any) {
        console.error('Error in createAddressService:', error.message);
        throw new Error('Failed to create donor: ' + error.message);
    }
}
export const updateAddressService = async (
    addressId: string,
    updateData: Partial<AddressData>
) => {
    try {
        if (updateData.beneficiaryId) {
            const beneficiaryExists = await prisma.beneficiary.findUnique({
                where: { id: updateData.beneficiaryId },
            });
            if (!beneficiaryExists) {
                throw new Error('Invalid beneficiaryId: Beneficiary does not exist');
            }
        }

        const result = await prisma.address.update({
            where: { id: addressId },
            data: {
                ...updateData,
            },
        });
        return result;
    } catch (error: any) {
        console.error('Error in updateAddressService:', error);

        if (error.code === 'P2025') {
            throw new Error(`Address with id ${addressId} not found.`);
        }

        throw new Error('Failed to update address: ' + error.message);
    }
};

export const deleteAddressService = async (addressId: string) => {
    try {
        const deletedAddress = await prisma.address.delete({
            where: { id: addressId },
        });

        return deletedAddress;
    } catch (error: any) {
        console.error('Error in deleteAddressService:', error);

        if (error.code === 'P2025') {
            throw new Error(`Address with id ${addressId} not found.`);
        }

        throw new Error('Failed to delete address: ' + error.message);
    }
}