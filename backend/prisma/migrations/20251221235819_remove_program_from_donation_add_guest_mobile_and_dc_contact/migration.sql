/*
  Warnings:

  - You are about to drop the column `programId` on the `Donation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_programId_fkey";

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "programId",
ADD COLUMN     "guestMobileNumber" TEXT;

-- AlterTable
ALTER TABLE "DonationCenter" ADD COLUMN     "contactNumber" TEXT;
