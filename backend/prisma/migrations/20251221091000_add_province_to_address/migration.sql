-- Safe migration to add `province` to Address:
-- 1) Add column as nullable
-- 2) Backfill existing rows with a sensible default ('Unknown')
-- 3) Make the column NOT NULL (optional step; included here)

BEGIN;

-- 1) Add column as nullable
ALTER TABLE "Address" ADD COLUMN "province" TEXT;

-- 2) Backfill existing rows
UPDATE "Address" SET "province" = 'Unknown' WHERE "province" IS NULL;

-- 3) Make column NOT NULL
ALTER TABLE "Address" ALTER COLUMN "province" SET NOT NULL;

COMMIT;
