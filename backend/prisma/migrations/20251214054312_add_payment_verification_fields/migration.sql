/*
  Warnings:

  - Made the column `occupation` on table `Beneficiary` required. This step will fail if there are existing NULL values in that column.
  - Made the column `householdAnnualSalary` on table `Beneficiary` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ProgramApplication" DROP CONSTRAINT "ProgramApplication_programRegistrationId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramApplication" DROP CONSTRAINT "ProgramApplication_qrCodeScannedByAdminId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramApplicationScan" DROP CONSTRAINT "ProgramApplicationScan_scannedByAdminId_fkey";

-- DropIndex
DROP INDEX "ProgramApplication_programRegistrationId_key";

-- DropIndex
DROP INDEX "ProgramApplicationScan_applicationId_scannedAt_idx";

-- AlterTable
ALTER TABLE "Beneficiary" ALTER COLUMN "occupation" SET NOT NULL,
ALTER COLUMN "householdAnnualSalary" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProgramApplication" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "registrationId" TEXT,
ALTER COLUMN "programRegistrationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProgramApplicationScan" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "qrCodeValue" TEXT;

-- AddForeignKey
ALTER TABLE "ProgramApplication" ADD CONSTRAINT "ProgramApplication_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "ProgramRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramApplication" ADD CONSTRAINT "ProgramApplication_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramApplicationScan" ADD CONSTRAINT "ProgramApplicationScan_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
