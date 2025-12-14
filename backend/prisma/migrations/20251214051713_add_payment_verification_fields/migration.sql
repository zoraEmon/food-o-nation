-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "monetaryAmount" DOUBLE PRECISION,
ADD COLUMN     "paymentProvider" TEXT,
ADD COLUMN     "paymentReceiptUrl" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "paymentVerifiedAt" TIMESTAMP(3);
