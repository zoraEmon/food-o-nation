import {
  Gender,
  CivilStatus,
  HouseholdPosition,
  IncomeSource,
  MainEmploymentStatus,
  FoodFrequency,
  FoodSecuritySeverity,
} from '../../generated/prisma/index.js';
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
  occupation?: string;
  householdNumber: number;
  householdAnnualSalary?: number;

  // Application details
  householdPosition: HouseholdPosition;
  householdPositionDetail?: string;
  primaryPhone: string;
  activeEmail?: string;
  governmentIdType?: string;
  governmentIdFileUrl?: string;

  // Household composition
  childrenCount: number;
  adultCount: number;
  seniorCount: number;
  pwdCount: number;

  // Health/Diet
  specialDietRequired: boolean;
  specialDietDescription?: string;

  // Economic
  monthlyIncome?: number;
  incomeSources: IncomeSource[];
  mainEmploymentStatus?: MainEmploymentStatus;
  receivingAid: boolean;
  receivingAidDetail?: string;

  // Consent
  declarationAccepted: boolean;
  privacyAccepted: boolean;
  signatureUrl?: string;

  // Nested relations
  householdMembers?: HouseholdMemberInput[];
  address: AddressInput;
  userId: string;
}

export interface HouseholdMemberInput {
  fullName: string;
  birthDate: Date | string;
  age: number;
  relationship: string;
}

export interface AddressInput {
  streetNumber: string;
  barangay: string;
  municipality: string;
  region?: string;
  country?: string;
  zipCode?: string;
}

export interface FoodSecuritySurveyInput {
  periodStart?: string;
  periodEnd?: string;
  q1: FoodFrequency;
  q2: FoodFrequency;
  q3: FoodFrequency;
  q4: FoodFrequency;
  q5: FoodFrequency;
  q6: FoodFrequency;
  totalScore?: number;
  severity?: FoodSecuritySeverity;
  notes?: string;
}