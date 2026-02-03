# Sertifikasi Aset Tower PLN (Sistem Informasi Monitoring)

Sistem Informasi berbasis Web untuk memonitoring sertifikasi aset tanah tower PLN (Unit Sentral) dengan visualisasi geospasial (Peta). Sistem ini membantu memetakan aset, melacak status sertifikasi (SHM/HGB/dll), dan mengidentifikasi permasalahan aset (Tumpak Tindih, Sengketa, dll).

## 🚀 Fitur Utama

- **Dashboard Monitoring**: Statistik real-time total aset, sertifikasi, aset bermasalah, dan _expiry warning_ (sertifikat akan habis).
- **Peta Geospasial (GIS)**: Visualisasi lokasi tower/aset menggunakan Leaflet.js dengan fitur clustering.
  - Marker berwarna berdasarkan status (Hijau = Aman, Merah = Bermasalah).
  - Pop-up detail aset.
- **Manajemen Aset**: CRUD data aset tower.
- **Import Data Excel**: Fitur bulk import data aset dari file Excel dengan validasi otomatis.
- **Role-Based Access Control (RBAC)**:
  - **Master**: Akses penuh (Manajemen User, Aset, Import).
  - **Admin**: Akses manajemen operasi.
  - **Operator**: Akses khusus operasional lapangan (View Only / Update Terbatas).
- **Sistem Notifikasi**: Peringatan otomatis untuk sertifikat yang akan kadaluarsa dalam 30 hari.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Maps**: [Leaflet](https://leafletjs.com/) & React-Leaflet
- **Icons**: [Lucide React](https://lucide.dev/)

## ⚙️ Cara Instalasi & Setup

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di lokal:

### 1. Prasyarat

- Node.js (v18 ke atas)
- PostgreSQL Database (Local atau Cloud seperti Neon/Supabase)

### 2. Instalasi Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment (.env)

Buat file `.env` di root folder dan sesuaikan isinya:

```env
# Database Connection String
DATABASE_URL="postgresql://user:password@localhost:5432/sertifikasi_tower?schema=public"

# NextAuth Secret (Bebas, bisa generate random string)
NEXTAUTH_SECRET="rahasia_dapur_pln_2024"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database

Jalankan migrasi prisma untuk membuat tabel:

```bash
npx prisma db push
```

Jalankan seeder untuk mengisi data awal (User default & Dummy Assets):

```bash
npx prisma db seed
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🔑 Akun Default (Seeder)

Gunakan akun berikut untuk login pertama kali:

| Role         | Username   | Password      | Deskripsi                            |
| :----------- | :--------- | :------------ | :----------------------------------- |
| **MASTER**   | `master`   | `master123`   | Akses penuh sistem & user management |
| **ADMIN**    | `admin`    | `admin123`    | Administrator operasional            |
| **OPERATOR** | `operator` | `operator123` | User lapangan / view only            |

> **Catatan**: Password user disimpan menggunakan hash bcrypt.

---

## 📊 Mapping Import Excel

Fitur import Excel menggunakan logika mapping pintar. Pastikan header kolom Excel Anda sesuai (case-insensitive sebagian, tapi disarankan ikuti format di bawah).

### Format Kolom Excel

| Header Excel (Diharapkan) | Field Database           | Tipe Data | Keterangan / Default                                                                                       |
| :------------------------ | :----------------------- | :-------- | :--------------------------------------------------------------------------------------------------------- |
| `kodeSap`                 | `kodeSap`                | Number    | **Primary Key**. Jika kosong, auto-generate (10000+). Jika ada duplikat di DB, sistem akan mencoba update. |
| `kodeUnit`                | `kodeUnit`               | Number    | Default: `3215`                                                                                            |
| `deskripsi`               | `deskripsi`              | String    | Nama/Keterangan Aset                                                                                       |
| `alamat`                  | `alamat`                 | String    | Alamat aset                                                                                                |
| `desa`                    | `desa`                   | String    | Kelurahan/Desa                                                                                             |
| `kecamatan`               | `kecamatan`              | String    | Kecamatan                                                                                                  |
| `kabupaten`               | `kabupaten`              | String    | Kabupaten/Kota                                                                                             |
| `provinsi`                | `provinsi`               | String    | Default: `LAMPUNG`                                                                                         |
| `koordinatX`              | `koordinatX`             | Float     | Longitude (Garis Bujur)                                                                                    |
| `koordinatY`              | `koordinatY`             | Float     | Latitude (Garis Lintang)                                                                                   |
| `luasTanah`               | `luasTanah`              | Float     | Luas dalam m2                                                                                              |
| `tahunPerolehan`          | `tahunPerolehan`         | Int       | Tahun aset didapat                                                                                         |
| `jenisDokumen`            | `jenisDokumen`           | String    | Contoh: SHM, HGB                                                                                           |
| `nomorSertifikat`         | `nomorSertifikat`        | String    | Nomor dokumen legal                                                                                        |
| `tanggalAwalSertifikat`   | `tanggalAwalSertifikat`  | Date      | Format: `DD/MM/YYYY` atau `YYYY-MM-DD`                                                                     |
| `tanggalAkhirSertifikat`  | `tanggalAkhirSertifikat` | Date      | Format: `DD/MM/YYYY` atau `YYYY-MM-DD`                                                                     |
| `penguasaanTanah`         | `penguasaanTanah`        | Enum      | Pilihan: `DIKUASAI`, `TIDAK_DIKUASAI`. Default: `DIKUASAI`                                                 |
| `jenisBangunan`           | `jenisBangunan`          | Enum      | Pilihan: `TAPAK_TOWER`, `GARDU_INDUK`. Default: `TAPAK_TOWER`                                              |
| `permasalahanAset`        | `permasalahanAset`       | Enum      | Pilihan: `CLEAN_AND_CLEAR`, `TUMPAK_TINDIH`, dll. Default: `CLEAN_AND_CLEAR`                               |

### Logika Import

1.  **Replace All**: Jika opsi ini dipilih saat upload, **SEMUA** data aset lama akan dihapus sebelum import baru.
2.  **Smart Update**: Jika tidak replace all, sistem mengecek `kodeSap`.
    - Jika `kodeSap` sudah ada -> **Update** data tersebut.
    - Jika `kodeSap` belum ada -> **Insert** data baru.

---

## 📂 Struktur Folder Projek

```
sertifikasi_tower/
├── app/                    # Next.js App Router
│   ├── api/                # Backend API Routes (Import, Auth, dll)
│   ├── assets/             # Halaman Manajemen Aset
│   ├── auth/               # Halaman Login
│   ├── components/         # Komponen UI (Map, Sidebar, Navbar)
│   ├── dashboard/          # Halaman Dashboard Utama
│   ├── maps/               # Halaman Peta Besar
│   └── ...
├── lib/                    # Library / Helper Functions
│   ├── prisma.ts           # Koneksi DB Singleton
│   ├── auth.ts             # Konfigurasi NextAuth
│   └── ...
├── prisma/                 # Database Config
│   ├── schema.prisma       # Schema Database
│   └── seed.ts             # Data Awal (Seeder)
├── public/                 # File Statis (Gambar, Icon)
└── ...
```

## ⚠️ Troubleshooting

1.  **Gagal Connect Database**: Pastikan URL di `.env` benar dan PostgreSQL service berjalan.
2.  **Import Excel Error**: Cek format tanggal di Excel. Pastikan menggunakan format Text atau Date yang valid (DD/MM/YYYY).
3.  **Map Tidak Muncul**: Pastikan file CSS Leaflet ter-load di `layout.tsx` atau `globals.css` (biasanya otomatis via `react-leaflet`).

---

_Dibuat untuk Kerja Praktik (KP) - Monitoring Sertifikasi Aset Tower PLN._
