/*
  Warnings:

  - You are about to drop the column `lokasiTowerId` on the `foto_asets` table. All the data in the column will be lost.
  - You are about to drop the `lokasi_towers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `masalah_asets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pendayagunaan_asets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sertifikasi_towers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `status_towers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `asetTowerId` to the `foto_asets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PermasalahanAset" AS ENUM ('CLEAN_AND_CLEAR', 'TUMPAK_TINDIH');

-- DropForeignKey
ALTER TABLE "foto_asets" DROP CONSTRAINT "foto_asets_lokasiTowerId_fkey";

-- DropForeignKey
ALTER TABLE "masalah_asets" DROP CONSTRAINT "masalah_asets_lokasiTowerId_fkey";

-- DropForeignKey
ALTER TABLE "pendayagunaan_asets" DROP CONSTRAINT "pendayagunaan_asets_lokasiTowerId_fkey";

-- DropForeignKey
ALTER TABLE "sertifikasi_towers" DROP CONSTRAINT "sertifikasi_towers_lokasiTowerId_fkey";

-- DropForeignKey
ALTER TABLE "status_towers" DROP CONSTRAINT "status_towers_lokasiTowerId_fkey";

-- AlterTable
ALTER TABLE "foto_asets" DROP COLUMN "lokasiTowerId",
ADD COLUMN     "asetTowerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "lokasi_towers";

-- DropTable
DROP TABLE "masalah_asets";

-- DropTable
DROP TABLE "pendayagunaan_asets";

-- DropTable
DROP TABLE "sertifikasi_towers";

-- DropTable
DROP TABLE "status_towers";

-- CreateTable
CREATE TABLE "aset_towers" (
    "id" TEXT NOT NULL,
    "kodeSap" INTEGER NOT NULL DEFAULT 10100,
    "kodeUnit" INTEGER NOT NULL DEFAULT 3215,
    "deskripsi" TEXT,
    "luasTanah" DOUBLE PRECISION,
    "tahunPerolehan" INTEGER,
    "alamat" TEXT,
    "desa" TEXT,
    "kecamatan" TEXT,
    "kabupaten" TEXT,
    "provinsi" TEXT,
    "koordinatX" DOUBLE PRECISION NOT NULL,
    "koordinatY" DOUBLE PRECISION NOT NULL,
    "jenisBangunan" "JenisBangunan" NOT NULL,
    "jenisDokumen" TEXT,
    "nomorSertifikat" TEXT,
    "tanggalAwalSertifikat" TIMESTAMP(3),
    "tanggalAkhirSertifikat" TIMESTAMP(3),
    "linkSertifikat" TEXT,
    "penguasaanTanah" "StatusPenguasaanTanah" NOT NULL,
    "permasalahanAset" "PermasalahanAset" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aset_towers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "foto_asets" ADD CONSTRAINT "foto_asets_asetTowerId_fkey" FOREIGN KEY ("asetTowerId") REFERENCES "aset_towers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
