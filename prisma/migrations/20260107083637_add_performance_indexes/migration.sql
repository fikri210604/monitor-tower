/*
  Warnings:

  - The `permasalahanAset` column on the `aset_towers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[kodeSap]` on the table `aset_towers` will be added. If there are existing duplicate values, this will fail.

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

-- CreateIndex
CREATE INDEX "aset_towers_koordinatY_koordinatX_idx" ON "aset_towers"("koordinatY", "koordinatX");

-- CreateIndex
CREATE INDEX "aset_towers_kodeSap_idx" ON "aset_towers"("kodeSap");

-- CreateIndex
CREATE INDEX "aset_towers_createdAt_idx" ON "aset_towers"("createdAt");

-- CreateIndex
CREATE INDEX "aset_towers_deskripsi_idx" ON "aset_towers"("deskripsi");

-- CreateIndex
CREATE UNIQUE INDEX "aset_towers_kodeSap_key" ON "aset_towers"("kodeSap");
