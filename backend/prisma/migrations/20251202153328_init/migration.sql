/*
  Warnings:

  - The `status` column on the `ProgramRegistration` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('PENDING', 'APPROVED', 'CLAIMED', 'CANCELED', 'REJECTED');

-- AlterTable
ALTER TABLE "ProgramRegistration" DROP COLUMN "status",
ADD COLUMN     "status" "ProgramStatus" NOT NULL DEFAULT 'PENDING';
