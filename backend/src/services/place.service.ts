import { PrismaClient, Prisma } from '../../generated/prisma/index.js';
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
}


type UpdatablePlaceFields = 'name' | 'address' | 'latitude' | 'longitude';

function validateLatitude(value: number | string): number {
  const parsed = Number(value);
  if (isNaN(parsed) || parsed < -90 || parsed > 90) {
    throw new Error('Latitude must be a number between -90 and 90.');
  }
  return parsed;
}

function validateLongitude(value: number | string): number {
  const parsed = Number(value);
  if (isNaN(parsed) || parsed < -180 || parsed > 180) {
    throw new Error('Longitude must be a number between -180 and 180.');
  }
  return parsed;
}

export const updatePlaceService = async (
  placeId: string,
  updateData: Partial<PlaceData>
) => {
  try {
    const safeData: Prisma.PlaceUpdateInput = {};
    const allowedFields: UpdatablePlaceFields[] = ['name', 'address', 'latitude', 'longitude'];

    for (const key of Object.keys(updateData) as UpdatablePlaceFields[]) {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        if (key === 'latitude') {
          safeData.latitude = validateLatitude(updateData.latitude!);
        } else if (key === 'longitude') {
          safeData.longitude = validateLongitude(updateData.longitude!);
        } else {
          safeData[key] = updateData[key]!;
        }
      }
    }

    if (Object.keys(safeData).length === 0) {
      throw new Error('No valid fields provided for update.');
    }

    const updatedPlace = await prisma.place.update({
      where: { id: placeId },
      data: safeData,
    });

    return updatedPlace;
  } catch (error: any) {
    console.error('Error in updatePlaceService:', error);

    if (error.code === 'P2025') {
      throw new Error(`Place with id ${placeId} not found.`);
    }

    throw new Error('Failed to update place: ' + error.message);
  }
};
