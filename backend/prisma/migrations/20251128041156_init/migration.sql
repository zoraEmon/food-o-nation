/*
  Warnings:

  - The primary key for the `Address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `addressId` on the `Address` table. All the data in the column will be lost.
  - The primary key for the `Beneficiary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `beneficiaryId` on the `Beneficiary` table. All the data in the column will be lost.
  - You are about to drop the column `middleInitial` on the `Beneficiary` table. All the data in the column will be lost.
  - You are about to drop the column `centerId` on the `Donation` table. All the data in the column will be lost.
  - The primary key for the `DonationCenter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `centerId` on the `DonationCenter` table. All the data in the column will be lost.
  - The primary key for the `Donor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `donorId` on the `Donor` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `User` table. All the data in the column will be lost.
  - The required column `id` was added to the `Address` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `streetNumber` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `region` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zipCode` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `birthDate` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Beneficiary` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Changed the type of `civilStatus` on the `Beneficiary` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `occupation` on table `Beneficiary` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `programId` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `DonationCenter` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `latitude` on table `DonationCenter` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `DonationCenter` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contactInfo` on table `DonationCenter` required. This step will fail if there are existing NULL values in that column.
  - The required column `id` was added to the `Donor` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "CivilStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_beneficiaryId_fkey";

-- DropForeignKey
ALTER TABLE "Beneficiary" DROP CONSTRAINT "Beneficiary_userId_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_centerId_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_donorId_fkey";

-- DropForeignKey
ALTER TABLE "Donor" DROP CONSTRAINT "Donor_userId_fkey";

-- DropForeignKey
ALTER TABLE "Program" DROP CONSTRAINT "Program_centerId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramRegistration" DROP CONSTRAINT "ProgramRegistration_beneficiaryId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP CONSTRAINT "Address_pkey",
DROP COLUMN "addressId",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "streetNumber" SET NOT NULL,
ALTER COLUMN "region" SET NOT NULL,
ALTER COLUMN "zipCode" SET NOT NULL,
ADD CONSTRAINT "Address_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Beneficiary" DROP CONSTRAINT "Beneficiary_pkey",
DROP COLUMN "beneficiaryId",
DROP COLUMN "middleInitial",
ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "middleName" TEXT,
DROP COLUMN "civilStatus",
ADD COLUMN     "civilStatus" "CivilStatus" NOT NULL,
ALTER COLUMN "occupation" SET NOT NULL,
ADD CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "centerId",
ADD COLUMN     "programId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DonationCenter" DROP CONSTRAINT "DonationCenter_pkey",
DROP COLUMN "centerId",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL,
ALTER COLUMN "contactInfo" SET NOT NULL,
ADD CONSTRAINT "DonationCenter_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Donor" DROP CONSTRAINT "Donor_pkey",
DROP COLUMN "donorId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "totalDonation" DOUBLE PRECISION,
ADD CONSTRAINT "Donor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "currentParticipants" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "userId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donor" ADD CONSTRAINT "Donor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "DonationCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramRegistration" ADD CONSTRAINT "ProgramRegistration_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
