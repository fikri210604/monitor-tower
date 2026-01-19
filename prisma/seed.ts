import { PrismaClient } from '../app/generated/prisma/client';
import { StatusPenguasaanTanah, JenisBangunan, PermasalahanAset, Role } from '../app/generated/prisma/enums';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create Users
  // Create Users
  const masterPassword = await bcrypt.hash("master123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);
  const operatorPassword = await bcrypt.hash("operator123", 10);

  const master = await prisma.user.upsert({
    where: { username: 'master' },
    update: {
      password: masterPassword,
      role: Role.MASTER,
    },
    create: {
      name: 'Master Account',
      username: 'master',
      password: masterPassword,
      role: Role.MASTER,
    },
  });

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: adminPassword,
      role: Role.ADMIN,
    },
    create: {
      name: 'Admin Pusat',
      username: 'admin',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const operator = await prisma.user.upsert({
    where: { username: 'operator' },
    update: {
      password: operatorPassword,
      role: Role.OPERATOR,
    },
    create: {
      name: 'Operator Wilayah',
      username: 'operator',
      password: operatorPassword,
      role: Role.OPERATOR,
    },
  });

  console.log('✅ Master user ready:', master.username);
  console.log('✅ Admin user ready:', admin.username);
  console.log('✅ Operator user ready:', operator.username);

  // Clean existing assets - COMMENTED OUT TO PRESERVE DATA
  // console.log('🧹 Membersihkan data aset lama...');
  // await prisma.asetTower.deleteMany();

  // Seed Assets
  const aset1 = await prisma.asetTower.create({
    data: {
      kodeSap: 10100,
      kodeUnit: 3215,
      deskripsi: 'GARDU INDUK KOTABUMI',
      luasTanah: 2500,
      tahunPerolehan: 1990,

      // Lokasi
      alamat: 'JL CURUP KEGUNGAN NO.10',
      desa: 'GURUH KEGUNGAN',
      kecamatan: 'KOTABUMI SELATAN',
      kabupaten: 'LAMPUNG UTARA',
      provinsi: 'LAMPUNG',
      koordinatX: 104.862938,
      koordinatY: -4.852055,

      // Legal
      jenisDokumen: 'Hak Pakai',
      nomorSertifikat: '08.04.07.03.4.00007',
      tanggalAwalSertifikat: new Date('2025-01-01'),
      tanggalAkhirSertifikat: new Date('2045-01-01'),
      linkSertifikat: 'https://example.com/sertifikat-dummy.pdf',

      // Fisik enums
      penguasaanTanah: StatusPenguasaanTanah.DIKUASAI,
      jenisBangunan: JenisBangunan.GARDU_INDUK,

      // Masalah enums
      permasalahanAset: PermasalahanAset.CLEAN_AND_CLEAR,

      // Foto
      fotoAset: {
        create: [
          {
            kategori: 'TAMPAK DEPAN',
            url: '/images/dummy-tower-depan.jpg',
            deskripsi: 'Gerbang masuk Gardu Induk',
          },
        ],
      },
    },
  });

  const aset2 = await prisma.asetTower.create({
    data: {
      kodeSap: 10101,
      kodeUnit: 3215,
      deskripsi: 'TAPAK TOWER T.15',
      luasTanah: 225,
      tahunPerolehan: 2005,

      // Lokasi
      alamat: 'DESA SUKAJADI',
      desa: 'SUKAJADI',
      kecamatan: 'NATAR',
      kabupaten: 'LAMPUNG SELATAN',
      provinsi: 'LAMPUNG',
      koordinatX: 105.200001,
      koordinatY: -5.350000,

      // Legal
      jenisDokumen: 'Hak Guna Bangunan',
      nomorSertifikat: 'B 2355397',
      tanggalAwalSertifikat: new Date('2005-08-15'),
      tanggalAkhirSertifikat: new Date('2035-08-15'),
      linkSertifikat: null,

      // Fisik
      penguasaanTanah: StatusPenguasaanTanah.DIKUASAI,
      jenisBangunan: JenisBangunan.TAPAK_TOWER,

      // Masalah
      permasalahanAset: PermasalahanAset.TUMPAK_TINDIH,
    },
  });

  const aset3 = await prisma.asetTower.create({
    data: {
      kodeSap: 10102,
      kodeUnit: 3215,
      deskripsi: 'TAPAK TOWER T.20',
      luasTanah: 400,
      tahunPerolehan: 2010,

      alamat: 'JL RAYA BYPASS',
      desa: 'RAJABASA',
      kecamatan: 'RAJABASA',
      kabupaten: 'BANDAR LAMPUNG',
      provinsi: 'LAMPUNG',
      koordinatX: 105.250000,
      koordinatY: -5.380000,

      jenisDokumen: 'Belum Bersertifikat',
      nomorSertifikat: null,

      penguasaanTanah: StatusPenguasaanTanah.DIKUASAI,
      jenisBangunan: JenisBangunan.TAPAK_TOWER,
      permasalahanAset: PermasalahanAset.TUMPAK_TINDIH,
    }
  });

  console.log(`✅ Berhasil input 3 data dummy aset.`);

  const count = await prisma.asetTower.count();
  console.log('📊 Total AsetTower di Database:', count);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

