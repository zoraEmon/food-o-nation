import { Gender, CivilStatus,DonorType } from '@prisma/client';
export interface ProgramData {
    title: string;
    description: string;
    date: string;
    maxParticipants: number;
    placeId: string;
}

export interface PlaceData {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    programs:string[]; // array of program ids
}

export interface BeneficiaryData {
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: Gender;
  birthDate: Date | string;
  contactNumber: string;
  age: number;
  civilStatus: CivilStatus;
  occupation: string;
  householdNumber: number;
  householdAnnualSalary: number;
  userId: string;
}
export interface DonorData {
  displayName: string;
  donorType: DonorType;
  totalDonation: string;
  points: number;
  userId: string;
}