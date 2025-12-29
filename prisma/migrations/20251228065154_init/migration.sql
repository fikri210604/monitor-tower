/*
  Warnings:

  - The values [MENARA,LAINNYA] on the enum `JenisBangunan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JenisBangunan_new" AS ENUM ('GARDU_INDUK', 'TAPAK_TOWER');
ALTER TABLE "status_towers" ALTER COLUMN "jenisBangunan" TYPE "JenisBangunan_new" USING ("jenisBangunan"::text::"JenisBangunan_new");
ALTER TYPE "JenisBangunan" RENAME TO "JenisBangunan_old";
ALTER TYPE "JenisBangunan_new" RENAME TO "JenisBangunan";
DROP TYPE "public"."JenisBangunan_old";
COMMIT;
