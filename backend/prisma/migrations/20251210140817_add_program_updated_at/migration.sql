/*
  Warnings:

  - Added the required column `updatedAt` to the `Program` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Add status with default
ALTER TABLE "Program" ADD COLUMN "status" "ProgramStatus" NOT NULL DEFAULT 'PENDING';

-- Add updatedAt with default now() so existing rows get a value
ALTER TABLE "Program" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- Backfill existing rows just in case
UPDATE "Program" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;
