/*
  Warnings:

  - You are about to drop the column `type` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `Donation` table. All the data in the column will be lost.
  - Added the required column `donationCenterId` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "type",
DROP COLUMN "volume",
ADD COLUMN     "donationCenterId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DonationItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,

    CONSTRAINT "DonationItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donationCenterId_fkey" FOREIGN KEY ("donationCenterId") REFERENCES "DonationCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationItem" ADD CONSTRAINT "DonationItem_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
