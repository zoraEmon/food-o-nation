-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_donationCenterId_fkey";

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "imageUrls" TEXT[],
ADD COLUMN     "qrCodeRef" TEXT,
ALTER COLUMN "donationCenterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donationCenterId_fkey" FOREIGN KEY ("donationCenterId") REFERENCES "DonationCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
