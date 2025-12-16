import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

// Service to get all programs
export const getAllHomeAddressService = async () => {
    return await prisma.address.findMany({
        include: {
            beneficiary: true, // Include related beneficiary data
        },
    });
};

