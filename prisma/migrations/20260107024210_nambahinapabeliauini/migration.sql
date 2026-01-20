/*
  Warnings:

  - The `permasalahanAset` column on the `aset_towers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'MASTER';
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "aset_towers" ALTER COLUMN "koordinatX" DROP NOT NULL,
ALTER COLUMN "koordinatY" DROP NOT NULL,
DROP COLUMN "permasalahanAset",
ADD COLUMN     "permasalahanAset" TEXT;
