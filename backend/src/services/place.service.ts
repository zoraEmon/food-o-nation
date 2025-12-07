import { PrismaClient } from '@prisma/client';
import { PlaceData } from '../interfaces/interfaces.js';
import { da } from 'zod/locales';

const prisma = new PrismaClient();

// Service to get all programs
export const getAllPlacesService = async () => {
    return await prisma.place.findMany({
        include: {
            donationCenter: true, // Include related donationCenter data
            programs: true, // Include related programs
        },
    });
};

// Service to get a program by ID
export const getPlaceByIdService = async (id: string) => {
    return await prisma.place.findUnique({
        where: { id },
        include: {
            donationCenter: true, // Include related donationCenter data
            programs: true, // Include related programs
        },
    });
};
export const createPlaceService  = async (data:PlaceData)=>{
    try{
        // const placeExists = await prisma.place.findUnique({
        //     where:{id: data.placeId},
        // });
        // if(placeExists){
        //     throw new Error('Invalid placeId: Place does not exist');
        // }
        const newPlace = await prisma.place.create({
            data:{
                name: data.name,
                address: data.address,
                latitude: parseFloat(data.latitude.toString()),
                longitude: parseFloat(data.longitude.toString()),
                programs: data.programs
                ? { connect: data.programs.map((programId) => ({ id: programId })) }
                : undefined,
            },
        });
        return newPlace
    }catch(error){
        console.error('Error in createPlaceService:', error.message);
        throw new Error('Failed to create place: ' + error.message);
    }
    // return await prisma.program.create({
    //     data:programData
    // })
}