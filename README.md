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

| Teknologi | Kegunaan |
|:---|:---|
| [Next.js 16](https://nextjs.org/) | Framework utama (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Bahasa pemrograman |
| [PostgreSQL](https://www.postgresql.org/) | Database |
| [Prisma ORM](https://www.prisma.io/) | Koneksi & query database |
| [NextAuth.js](https://next-auth.js.org/) | Autentikasi & session |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styling UI |
| [Leaflet](https://leafletjs.com/) & React-Leaflet | Peta interaktif |
| [Cloudinary](https://cloudinary.com/) | Upload & penyimpanan foto aset |
| [Recharts](https://recharts.org/) | Grafik & chart dashboard |

---

## ⚙️ Panduan Setup Lengkap (untuk Server / Production)

> Panduan ini ditujukan untuk menjalankan aplikasi di **server Linux** (misalnya Ubuntu). Ikuti setiap langkah secara berurutan.

---

### Langkah 1 — Persiapan (Prasyarat)

Pastikan server sudah terinstall software berikut sebelum mulai:

#### ✅ Node.js (versi 18 ke atas)

```bash
# Cek apakah Node.js sudah ada
node -v

# Jika belum ada, install via NodeSource (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### ✅ npm (sudah otomatis ikut Node.js)

```bash
# Cek versi npm
npm -v
```

#### ✅ Git (untuk clone repository)

```bash
# Cek git
git --version

# Jika belum ada
sudo apt-get install -y git
```

---

### Langkah 2 — Clone Repository

```bash
git clone https://github.com/[username]/sertifikasi_tower.git
cd sertifikasi_tower
```

---

### Langkah 3 — Install Semua Package / Dependensi

Perintah ini akan membaca file `package.json` dan menginstall semua library yang dibutuhkan ke folder `node_modules/`.

```bash
npm install
```

> **Catatan**: Proses ini membutuhkan koneksi internet dan mungkin memakan waktu 1–3 menit. Jangan diinterupsi.

Berikut daftar package utama yang akan diinstall otomatis:

| Package | Fungsi |
|:---|:---|
| `next` | Framework web utama |
| `react`, `react-dom` | Library UI |
| `@prisma/client`, `prisma` | ORM untuk database |
| `@prisma/adapter-pg`, `pg` | Adapter koneksi PostgreSQL |
| `next-auth` | Sistem login & session |
| `bcryptjs` | Enkripsi password |
| `cloudinary` | Upload foto ke cloud |
| `leaflet`, `react-leaflet` | Peta interaktif |
| `recharts` | Grafik dashboard |
| `xlsx` | Baca file Excel |
| `tailwindcss` | Framework CSS |

---

### Langkah 4 — Konfigurasi Environment Variables (`.env`)

File `.env` berisi **konfigurasi rahasia** seperti koneksi database, API key, dll. File ini **tidak boleh di-commit ke Git**.

#### Buat file `.env` di root folder proyek:

```bash
# Buat file .env dari template
cp .env.example .env

# Atau buat manual
nano .env
```

#### Isi file `.env` dengan nilai yang sesuai:

```env
# ============================================================
# DATABASE — Koneksi ke PostgreSQL
# ============================================================

# URL untuk koneksi normal (via connection pooler seperti PgBouncer/Supabase)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:password_anda@localhost:5432/sertifikasi_tower"

# URL untuk koneksi langsung (digunakan saat menjalankan migrasi)
# Biasanya sama dengan DATABASE_URL jika tidak pakai pooler
DIRECT_URL="postgresql://postgres:password_anda@localhost:5432/sertifikasi_tower"

# ============================================================
# NEXTAUTH — Konfigurasi Autentikasi
# ============================================================

# Secret key untuk enkripsi session. Ganti dengan string acak yang panjang.
# Generate di terminal: openssl rand -base64 32
NEXTAUTH_SECRET="isi-dengan-random-string-panjang-minimal-32-karakter"

# URL aplikasi yang sedang berjalan (sesuaikan dengan domain/IP server)
NEXTAUTH_URL="http://localhost:3000"
# Contoh untuk production: NEXTAUTH_URL="https://domain-anda.com"

# ============================================================
# CLOUDINARY — Penyimpanan Foto Aset (Opsional)
# ============================================================
# Daftar gratis di https://cloudinary.com untuk mendapatkan kredensial ini.
# Jika tidak digunakan, fitur upload foto tidak akan berfungsi.

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=nama_cloud_anda
CLOUDINARY_API_KEY=api_key_anda
CLOUDINARY_API_SECRET=api_secret_anda
```

> **Tips generate NEXTAUTH_SECRET** di terminal:
> ```bash
> openssl rand -base64 32
> ```
> Salin hasilnya dan tempel sebagai nilai `NEXTAUTH_SECRET`.

---

### Langkah 5 — Setup Database PostgreSQL

Proyek ini menggunakan **PostgreSQL**. Ada dua pilihan database yang bisa digunakan:

#### Pilihan A: PostgreSQL Lokal di Server

```bash
# Install PostgreSQL (Ubuntu)
sudo apt-get install -y postgresql postgresql-contrib

# Masuk ke PostgreSQL
sudo -u postgres psql

# Di dalam psql, buat database dan user baru
CREATE DATABASE sertifikasi_tower;
CREATE USER tower_user WITH PASSWORD 'password_kuat_anda';
GRANT ALL PRIVILEGES ON DATABASE sertifikasi_tower TO tower_user;
\q
```

Lalu isi `.env`:
```env
DATABASE_URL="postgresql://tower_user:password_kuat_anda@localhost:5432/sertifikasi_tower"
DIRECT_URL="postgresql://tower_user:password_kuat_anda@localhost:5432/sertifikasi_tower"
```

#### Pilihan B: Database Cloud (Supabase — Rekomendasi untuk kemudahan)

1. Buka [https://supabase.com](https://supabase.com) dan buat akun gratis.
2. Buat **New Project** baru.
3. Setelah project dibuat, buka **Settings → Database**.
4. Salin **Connection string** (mode `Transaction` untuk `DATABASE_URL`, mode `Session` untuk `DIRECT_URL`).

```env
# Contoh format Supabase
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

---

### Langkah 6 — Generate Prisma Client

Perintah ini membaca `prisma/schema.prisma` dan men-generate kode TypeScript untuk berinteraksi dengan database. **Harus dijalankan setelah setiap perubahan schema.**

```bash
npx prisma generate
```

---

### Langkah 7 — Jalankan Migrasi Database

Perintah ini membuat semua tabel yang dibutuhkan di dalam database sesuai dengan `prisma/schema.prisma`.

```bash
# Untuk development / setup awal
npx prisma db push

# ATAU untuk production (lebih disarankan, menggunakan migration history)
npx prisma migrate deploy
```

> **Perbedaan `db push` vs `migrate deploy`**:
> - `db push` → Langsung sinkronkan schema ke DB, cocok untuk setup cepat.
> - `migrate deploy` → Menjalankan file migrasi yang sudah ada, lebih aman untuk production.

Setelah berhasil, tabel berikut akan terbentuk di database:
- `users` — Data pengguna sistem
- `aset_towers` — Data aset tower PLN
- `foto_asets` — Data foto aset
- `activity_logs` — Log aktivitas pengguna

---

### Langkah 8 — Isi Data Awal (Seeder)

Perintah ini akan membuat **akun user default** dan beberapa **data contoh aset** agar aplikasi bisa langsung diuji.

```bash
npx prisma db seed
```

Output yang diharapkan:
```
✅ Master user ready: master
✅ Admin user ready: admin
✅ Operator user ready: operator
✅ Berhasil input 3 data dummy aset.
📊 Total AsetTower di Database: 3
```

---

### Langkah 9 — Build & Jalankan Aplikasi

#### Untuk Development (testing):

```bash
npm run dev
```

Buka browser ke `http://localhost:3000`.

#### Untuk Production (server):

```bash
# Build aplikasi (proses kompilasi, butuh beberapa menit)
npm run build

# Jalankan aplikasi dalam mode production
npm run start
```

Untuk menjalankan di background agar tidak mati saat terminal ditutup, gunakan `pm2`:

```bash
# Install pm2 secara global
npm install -g pm2

# Jalankan aplikasi dengan pm2
pm2 start npm --name "sertifikasi-tower" -- start

# Cek status
pm2 status

# Lihat log
pm2 logs sertifikasi-tower

# Agar otomatis jalan saat server restart
pm2 startup
pm2 save
```

---

## 🔑 Akun Default (Setelah Seeder)

Gunakan akun berikut untuk login pertama kali:

| Role | Username | Password | Deskripsi |
| :--- | :--- | :--- | :--- |
| **MASTER** | `master` | `master123` | Akses penuh sistem & user management |
| **ADMIN** | `admin` | `admin123` | Administrator operasional |
| **OPERATOR** | `operator` | `operator123` | User lapangan / view only |

> ⚠️ **Penting**: Segera ganti password akun `master` setelah login pertama kali di production!

---

## 📋 Ringkasan Urutan Perintah (Quick Reference)

Jalankan perintah berikut secara berurutan setelah clone repository:

```bash
# 1. Install semua package
npm install

# 2. Buat dan isi file .env (sesuaikan nilainya)
cp .env.example .env  # atau buat manual

# 3. Generate Prisma Client
npx prisma generate

# 4. Buat tabel di database
npx prisma db push

# 5. Isi data awal
npx prisma db seed

# 6a. Jalankan (development)
npm run dev

# 6b. Build + jalankan (production)
npm run build
npm run start
```

---

## ⚠️ Troubleshooting

### ❌ Error: `DATABASE_URL not found` atau gagal connect ke database
- Pastikan file `.env` sudah dibuat di root folder proyek (sejajar dengan `package.json`).
- Pastikan nilai `DATABASE_URL` sudah benar dan database PostgreSQL-nya sedang berjalan.
- Coba test koneksi manual: `psql "postgresql://user:password@host:port/dbname"`

### ❌ Error: `Environment variable not found: DATABASE_URL` saat `prisma generate`
- Pastikan `.env` ada dan tidak kosong.
- Coba jalankan: `npx dotenv -e .env -- npx prisma generate`

### ❌ Error saat `npm run build`
- Pastikan sudah menjalankan `npx prisma generate` terlebih dahulu.
- Cek apakah ada error TypeScript dengan menjalankan `npx tsc --noEmit`.

### ❌ Error: Port 3000 sudah dipakai
```bash
# Cari proses yang menggunakan port 3000
lsof -i :3000

# Atau jalankan di port lain
PORT=3001 npm run start
```

### ❌ Peta tidak muncul
- Pastikan browser mendukung JavaScript dan tidak memblokir koneksi ke tile server Leaflet.
- Pastikan data koordinat aset (`koordinatX`, `koordinatY`) sudah terisi di database.

### ❌ Upload foto tidak berfungsi
- Pastikan variabel `CLOUDINARY_*` di `.env` sudah diisi dengan benar.
- Daftar dan ambil kredensial dari [https://cloudinary.com](https://cloudinary.com).

---

## 📂 Struktur Folder Proyek

```
sertifikasi_tower/
├── app/                    # Next.js App Router (halaman & API)
│   ├── api/                # Backend API Routes (Import, Auth, Aset, dll)
│   ├── assets/             # Halaman Manajemen Aset
│   ├── auth/               # Halaman Login
│   ├── components/         # Komponen UI (Map, Sidebar, Navbar, dll)
│   ├── dashboard/          # Halaman Dashboard Utama
│   └── maps/               # Halaman Peta Besar
├── constants/              # Konstanta global (enum label, dll)
├── hooks/                  # Custom React Hooks
├── lib/                    # Helper & konfigurasi
│   ├── prisma.ts           # Singleton koneksi Prisma ke DB
│   └── auth.ts             # Konfigurasi NextAuth
├── prisma/                 # Konfigurasi Database
│   ├── schema.prisma       # Definisi tabel & relasi database
│   ├── seed.ts             # Script pengisi data awal
│   └── migrations/         # Riwayat perubahan skema database
├── public/                 # File statis (gambar, icon)
├── src/generated/          # Kode Prisma Client (auto-generated, jangan diedit manual)
├── types/                  # Definisi TypeScript types
├── utils/                  # Fungsi-fungsi utility
├── middleware.ts            # Middleware (proteksi route berdasarkan role)
├── next.config.ts           # Konfigurasi Next.js
├── prisma.config.ts         # Konfigurasi Prisma CLI
├── package.json             # Daftar dependensi & scripts
├── tsconfig.json            # Konfigurasi TypeScript
└── .env                     # ⚠️ Variabel environment (RAHASIA, jangan di-commit!)
```

---

## 📊 Mapping Import Excel

Fitur import Excel menggunakan logika mapping pintar. Pastikan header kolom Excel sesuai (case-insensitive sebagian, tapi disarankan ikuti format di bawah).

### Format Kolom Excel

| Header Excel | Field Database | Tipe Data | Keterangan |
| :--- | :--- | :--- | :--- |
| `kodeSap` | `kodeSap` | Number | **Primary Key**. Jika kosong, auto-generate. Jika duplikat → update. |
| `kodeUnit` | `kodeUnit` | Number | Default: `3215` |
| `deskripsi` | `deskripsi` | String | Nama/Keterangan Aset |
| `alamat` | `alamat` | String | Alamat aset |
| `desa` | `desa` | String | Kelurahan/Desa |
| `kecamatan` | `kecamatan` | String | Kecamatan |
| `kabupaten` | `kabupaten` | String | Kabupaten/Kota |
| `provinsi` | `provinsi` | String | Default: `LAMPUNG` |
| `koordinatX` | `koordinatX` | Float | Longitude (Garis Bujur) |
| `koordinatY` | `koordinatY` | Float | Latitude (Garis Lintang) |
| `luasTanah` | `luasTanah` | Float | Luas dalam m² |
| `tahunPerolehan` | `tahunPerolehan` | Int | Tahun aset didapat |
| `jenisDokumen` | `jenisDokumen` | String | Contoh: SHM, HGB, Hak Pakai |
| `nomorSertifikat` | `nomorSertifikat` | String | Nomor dokumen legal |
| `tanggalAwalSertifikat` | `tanggalAwalSertifikat` | Date | Format: `DD/MM/YYYY` atau `YYYY-MM-DD` |
| `tanggalAkhirSertifikat` | `tanggalAkhirSertifikat` | Date | Format: `DD/MM/YYYY` atau `YYYY-MM-DD` |
| `penguasaanTanah` | `penguasaanTanah` | Enum | `DIKUASAI` / `TIDAK_DIKUASAI`. Default: `DIKUASAI` |
| `jenisBangunan` | `jenisBangunan` | Enum | `TAPAK_TOWER` / `GARDU_INDUK`. Default: `TAPAK_TOWER` |
| `permasalahanAset` | `permasalahanAset` | Enum | `CLEAN_AND_CLEAR` / `TUMPAK_TINDIH`. Default: `CLEAN_AND_CLEAR` |

### Logika Import

1. **Replace All**: Jika opsi ini dipilih saat upload, **SEMUA** data aset lama akan dihapus sebelum import baru.
2. **Smart Update**: Jika tidak replace all, sistem mengecek `kodeSap`.
   - Jika `kodeSap` sudah ada → **Update** data tersebut.
   - Jika `kodeSap` belum ada → **Insert** data baru.

---

_Dibuat untuk Kerja Praktik (KP) — Monitoring Sertifikasi Aset Tower PLN._
