-- CreateEnum
CREATE TYPE "DonationItemStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "DonationItem" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "status" "DonationItemStatus" NOT NULL DEFAULT 'PENDING';
