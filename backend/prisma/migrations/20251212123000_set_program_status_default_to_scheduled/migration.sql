-- Step 2: Use the enum value in a separate migration
-- Set default after the new enum value has been committed
ALTER TABLE "Program" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';