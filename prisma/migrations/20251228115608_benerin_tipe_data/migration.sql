/*
  Warnings:

  - You are about to alter the column `unitId` on the `lokasi_towers` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "lokasi_towers" ALTER COLUMN "unitId" SET DATA TYPE INTEGER;
