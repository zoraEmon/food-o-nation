-- CreateTable
CREATE TABLE "StallApplication" (
    "id" TEXT NOT NULL,
    "stallReservationId" TEXT NOT NULL,
    "qrCodeValue" TEXT NOT NULL,
    "qrCodeImageUrl" TEXT,
    "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledDate" TIMESTAMP(3),
    "qrCodeScannedAt" TIMESTAMP(3),
    "qrCodeScannedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StallApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StallApplicationScan" (
    "id" TEXT NOT NULL,
    "stallApplicationId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "scannedByAdminId" TEXT,

    CONSTRAINT "StallApplicationScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StallApplication_stallReservationId_key" ON "StallApplication"("stallReservationId");

-- CreateIndex
CREATE UNIQUE INDEX "StallApplication_qrCodeValue_key" ON "StallApplication"("qrCodeValue");

-- AddForeignKey
ALTER TABLE "StallApplication" ADD CONSTRAINT "StallApplication_stallReservationId_fkey" FOREIGN KEY ("stallReservationId") REFERENCES "StallReservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StallApplication" ADD CONSTRAINT "StallApplication_qrCodeScannedByAdminId_fkey" FOREIGN KEY ("qrCodeScannedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StallApplicationScan" ADD CONSTRAINT "StallApplicationScan_stallApplicationId_fkey" FOREIGN KEY ("stallApplicationId") REFERENCES "StallApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StallApplicationScan" ADD CONSTRAINT "StallApplicationScan_scannedByAdminId_fkey" FOREIGN KEY ("scannedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
