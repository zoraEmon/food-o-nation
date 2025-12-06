/*
  Warnings:

  - You are about to drop the column `address` on the `DonationCenter` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `DonationCenter` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `DonationCenter` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `DonationCenter` table. All the data in the column will be lost.
  - You are about to drop the column `centerId` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Program` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[placeId]` on the table `DonationCenter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `placeId` to the `DonationCenter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeId` to the `Program` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_donorId_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_programId_fkey";

-- DropForeignKey
ALTER TABLE "Program" DROP CONSTRAINT "Program_centerId_fkey";

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "guestEmail" TEXT,
ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentReference" TEXT,
ALTER COLUMN "donorId" DROP NOT NULL,
ALTER COLUMN "programId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DonationCenter" DROP COLUMN "address",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "name",
ADD COLUMN     "placeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Program" DROP COLUMN "centerId",
DROP COLUMN "location",
ADD COLUMN     "placeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DonationCenter_placeId_key" ON "DonationCenter"("placeId");

-- AddForeignKey
ALTER TABLE "DonationCenter" ADD CONSTRAINT "DonationCenter_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
