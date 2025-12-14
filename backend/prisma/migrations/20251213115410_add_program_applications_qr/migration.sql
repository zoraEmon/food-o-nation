-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ProgramApplication" (
    "id" TEXT NOT NULL,
    "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "qrCodeValue" TEXT NOT NULL,
    "qrCodeImageUrl" TEXT,
    "scheduledDeliveryDate" TIMESTAMP(3) NOT NULL,
    "actualDeliveryDate" TIMESTAMP(3),
    "qrCodeScannedAt" TIMESTAMP(3),
    "qrCodeScannedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "programRegistrationId" TEXT NOT NULL,

    CONSTRAINT "ProgramApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramApplicationScan" (
    "id" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "applicationId" TEXT NOT NULL,
    "scannedByAdminId" TEXT,

    CONSTRAINT "ProgramApplicationScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramApplication_qrCodeValue_key" ON "ProgramApplication"("qrCodeValue");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramApplication_programRegistrationId_key" ON "ProgramApplication"("programRegistrationId");

-- CreateIndex
CREATE INDEX "ProgramApplicationScan_applicationId_scannedAt_idx" ON "ProgramApplicationScan"("applicationId", "scannedAt");

-- AddForeignKey
ALTER TABLE "ProgramApplication" ADD CONSTRAINT "ProgramApplication_qrCodeScannedByAdminId_fkey" FOREIGN KEY ("qrCodeScannedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramApplication" ADD CONSTRAINT "ProgramApplication_programRegistrationId_fkey" FOREIGN KEY ("programRegistrationId") REFERENCES "ProgramRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramApplicationScan" ADD CONSTRAINT "ProgramApplicationScan_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ProgramApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramApplicationScan" ADD CONSTRAINT "ProgramApplicationScan_scannedByAdminId_fkey" FOREIGN KEY ("scannedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
