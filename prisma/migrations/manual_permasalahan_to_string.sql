-- Step 1: Add a new temporary column as TEXT
ALTER TABLE "aset_towers" ADD COLUMN "permasalahanAset_new" TEXT;

-- Step 2: Copy data from old enum column to new text column, converting enum values to strings
UPDATE "aset_towers" SET "permasalahanAset_new" = "permasalahanAset"::TEXT;

-- Step 3: Drop the old enum column
ALTER TABLE "aset_towers" DROP COLUMN "permasalahanAset";

-- Step 4: Rename the new column to the original name
ALTER TABLE "aset_towers" RENAME COLUMN "permasalahanAset_new" TO "permasalahanAset";

-- Step 5: Drop the enum type if it's no longer used
DROP TYPE IF EXISTS "PermasalahanAset";
