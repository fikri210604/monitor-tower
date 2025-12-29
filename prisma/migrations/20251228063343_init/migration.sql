-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "StatusPenyelesaianAset" AS ENUM ('BELUM_TERBIT_SERTIFIKAT', 'SUDAH_TERBIT_SERTIFIKAT');

-- CreateEnum
CREATE TYPE "StatusPenguasaanTanah" AS ENUM ('DIKUASAI', 'TIDAK_DIKUASAI');

-- CreateEnum
CREATE TYPE "JenisBangunan" AS ENUM ('GARDU_INDUK', 'MENARA', 'LAINNYA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lokasi_towers" (
    "id" TEXT NOT NULL,
    "unitId" BIGINT NOT NULL,
    "unit" TEXT,
    "kodeSap" TEXT,
    "alamat" TEXT,
    "desa" TEXT,
    "kelurahan" TEXT,
    "kecamatan" TEXT,
    "kabupaten" TEXT,
    "provinsi" TEXT,
    "koordinatX" DOUBLE PRECISION,
    "koordinatY" DOUBLE PRECISION,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diupdatePada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lokasi_towers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_towers" (
    "id" TEXT NOT NULL,
    "lokasiTowerId" TEXT NOT NULL,
    "penguasaanTanah" "StatusPenguasaanTanah" NOT NULL,
    "jenisBangunan" "JenisBangunan" NOT NULL,
    "statusMilik" TEXT,
    "pemanfaatan" TEXT,

    CONSTRAINT "status_towers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sertifikasi_towers" (
    "id" TEXT NOT NULL,
    "lokasiTowerId" TEXT NOT NULL,
    "sertifikasi" TEXT,
    "progressSertifikasi" TEXT,
    "statusPenyelesaianAset" "StatusPenyelesaianAset" NOT NULL,
    "kantahBpn" TEXT,
    "wilayahBpn" TEXT,
    "statusOpname" TEXT,
    "lokasiSimpan" TEXT,
    "berlakuSampai" TIMESTAMP(3),
    "diupdatePada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sertifikasi_towers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "masalah_asets" (
    "id" TEXT NOT NULL,
    "lokasiTowerId" TEXT NOT NULL,
    "permasalahanAset" TEXT,
    "narasiPermasalahan" TEXT,
    "progressPermasalahan" TEXT,
    "statusPenyelesaian" "StatusPenyelesaianAset" NOT NULL,
    "tanggalLapor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "masalah_asets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendayagunaan_asets" (
    "id" TEXT NOT NULL,
    "lokasiTowerId" TEXT NOT NULL,
    "pendayagunaan" TEXT,
    "luasanDayaGuna" DOUBLE PRECISION,
    "nilaiPendayagunaan" DOUBLE PRECISION,
    "noKontrak" TEXT,
    "awalBerlaku" TIMESTAMP(3),
    "akhirBerlaku" TIMESTAMP(3),
    "kronologi" TEXT,
    "deskripsiPotensi" TEXT,
    "nilaiPotensi" DOUBLE PRECISION,

    CONSTRAINT "pendayagunaan_asets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foto_asets" (
    "id" TEXT NOT NULL,
    "lokasiTowerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kategori" TEXT,
    "deskripsi" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foto_asets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "lokasi_towers_kodeSap_key" ON "lokasi_towers"("kodeSap");

-- CreateIndex
CREATE UNIQUE INDEX "status_towers_lokasiTowerId_key" ON "status_towers"("lokasiTowerId");

-- CreateIndex
CREATE UNIQUE INDEX "sertifikasi_towers_lokasiTowerId_key" ON "sertifikasi_towers"("lokasiTowerId");

-- AddForeignKey
ALTER TABLE "status_towers" ADD CONSTRAINT "status_towers_lokasiTowerId_fkey" FOREIGN KEY ("lokasiTowerId") REFERENCES "lokasi_towers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikasi_towers" ADD CONSTRAINT "sertifikasi_towers_lokasiTowerId_fkey" FOREIGN KEY ("lokasiTowerId") REFERENCES "lokasi_towers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masalah_asets" ADD CONSTRAINT "masalah_asets_lokasiTowerId_fkey" FOREIGN KEY ("lokasiTowerId") REFERENCES "lokasi_towers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendayagunaan_asets" ADD CONSTRAINT "pendayagunaan_asets_lokasiTowerId_fkey" FOREIGN KEY ("lokasiTowerId") REFERENCES "lokasi_towers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_asets" ADD CONSTRAINT "foto_asets_lokasiTowerId_fkey" FOREIGN KEY ("lokasiTowerId") REFERENCES "lokasi_towers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
