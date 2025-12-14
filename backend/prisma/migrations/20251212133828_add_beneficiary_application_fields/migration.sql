/*
  Warnings:

  - Added the required column `householdPosition` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryPhone` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HouseholdPosition" AS ENUM ('MOTHER', 'FATHER', 'OTHER_RELATIVE', 'NON_RELATIVE_GUARDIAN');

-- CreateEnum
CREATE TYPE "IncomeSource" AS ENUM ('FORMAL_SALARIED', 'INFORMAL_GIG', 'GOV_ASSISTANCE', 'REMITTANCE', 'NONE');

-- CreateEnum
CREATE TYPE "MainEmploymentStatus" AS ENUM ('EMPLOYED_FULL_TIME', 'EMPLOYED_PART_TIME', 'RECENTLY_UNEMPLOYED', 'LONG_TERM_UNEMPLOYED', 'RETIRED_DISABLED');

-- CreateEnum
CREATE TYPE "FoodFrequency" AS ENUM ('NEVER', 'RARELY', 'SOMETIMES', 'OFTEN');

-- CreateEnum
CREATE TYPE "FoodSecuritySeverity" AS ENUM ('SECURE', 'MILD', 'MODERATE', 'SEVERE');

-- AlterTable
ALTER TABLE "Beneficiary" ADD COLUMN     "activeEmail" TEXT,
ADD COLUMN     "adultCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "childrenCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "governmentIdFileUrl" TEXT,
ADD COLUMN     "governmentIdType" TEXT,
ADD COLUMN     "householdPosition" "HouseholdPosition" NOT NULL,
ADD COLUMN     "householdPositionDetail" TEXT,
ADD COLUMN     "incomeSources" "IncomeSource"[] DEFAULT ARRAY[]::"IncomeSource"[],
ADD COLUMN     "mainEmploymentStatus" "MainEmploymentStatus",
ADD COLUMN     "monthlyIncome" DOUBLE PRECISION,
ADD COLUMN     "primaryPhone" TEXT NOT NULL,
ADD COLUMN     "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pwdCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "receivingAid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "receivingAidDetail" TEXT,
ADD COLUMN     "seniorCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "signatureUrl" TEXT,
ADD COLUMN     "specialDietDescription" TEXT,
ADD COLUMN     "specialDietRequired" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "occupation" DROP NOT NULL,
ALTER COLUMN "householdAnnualSalary" DROP NOT NULL;

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "age" INTEGER NOT NULL,
    "relationship" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodSecuritySurvey" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "q1" "FoodFrequency" NOT NULL,
    "q2" "FoodFrequency" NOT NULL,
    "q3" "FoodFrequency" NOT NULL,
    "q4" "FoodFrequency" NOT NULL,
    "q5" "FoodFrequency" NOT NULL,
    "q6" "FoodFrequency" NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "severity" "FoodSecuritySeverity" NOT NULL DEFAULT 'SECURE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodSecuritySurvey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FoodSecuritySurvey_beneficiaryId_periodStart_idx" ON "FoodSecuritySurvey"("beneficiaryId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "FoodSecuritySurvey_beneficiaryId_periodStart_periodEnd_key" ON "FoodSecuritySurvey"("beneficiaryId", "periodStart", "periodEnd");

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodSecuritySurvey" ADD CONSTRAINT "FoodSecuritySurvey_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
