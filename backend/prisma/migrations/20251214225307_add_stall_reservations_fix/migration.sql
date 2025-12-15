-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'CANCELLED', 'CHECKED_IN');

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "reservedStalls" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stallCapacity" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "StallReservation" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceledAt" TIMESTAMP(3),
    "checkedInAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "StallReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StallReservation_donorId_programId_idx" ON "StallReservation"("donorId", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "StallReservation_programId_slotNumber_key" ON "StallReservation"("programId", "slotNumber");

-- AddForeignKey
ALTER TABLE "StallReservation" ADD CONSTRAINT "StallReservation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StallReservation" ADD CONSTRAINT "StallReservation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
