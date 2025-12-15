-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "HouseholdPosition" ADD VALUE 'SON';
ALTER TYPE "HouseholdPosition" ADD VALUE 'DAUGHTER';
ALTER TYPE "HouseholdPosition" ADD VALUE 'GRANDMOTHER';
ALTER TYPE "HouseholdPosition" ADD VALUE 'GRANDFATHER';
ALTER TYPE "HouseholdPosition" ADD VALUE 'UNCLE';
ALTER TYPE "HouseholdPosition" ADD VALUE 'AUNTIE';
