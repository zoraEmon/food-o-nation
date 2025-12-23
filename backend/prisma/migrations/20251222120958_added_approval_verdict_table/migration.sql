-- CreateEnum
CREATE TYPE "ApprovalVerdict" AS ENUM ('BARELY_APPROVED', 'FAIRLY_APPROVED', 'EXTREMELY_APPROVED', 'COMPLETELY_APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "approvalVerdict" "ApprovalVerdict";
