# PresensiKu

Aplikasi web **absensi WFH karyawan** dan **monitoring oleh Admin HRD**.

Karyawan login, memotret diri sebagai bukti bekerja dari rumah, lalu menekan tombol absen. Tanggal dan jam absen dicatat oleh **server**, sehingga tidak bisa diakali dari HP atau laptop. Admin HRD dapat menambah dan mengubah data karyawan, serta **melihat** seluruh absensi beserta fotonya.

---

## Daftar isi

1. [Fitur](#fitur)
2. [Tech stack](#tech-stack)
3. [Arsitektur](#arsitektur)
4. [Struktur proyek](#struktur-proyek)
5. [Struktur database](#struktur-database)
6. [Menjalankan secara lokal](#menjalankan-secara-lokal)
7. [Akun demo](#akun-demo)
8. [API](#api)
9. [Aturan bisnis](#aturan-bisnis)
10. [Masalah yang sering muncul](#masalah-yang-sering-muncul)
11. [Membagikan lewat GitHub](#membagikan-lewat-github)
12. [Daftar script](#daftar-script)

---

## Fitur

### Karyawan

| Fitur | Keterangan |
|---|---|
| Login | Masuk dengan email dan password yang dibuat Admin HRD |
| Absen WFH | Foto dari kamera atau upload file (JPG/PNG, maks. 2 MB) + catatan opsional |
| Jam dari server | Tanggal dan jam absen dicatat server, bukan perangkat karyawan |
| Satu kali sehari | Absen kedua di hari yang sama otomatis ditolak |
| Riwayat absen | Daftar absen per bulan, persen kehadiran, dan rata-rata jam masuk |

### Admin HRD

| Fitur | Keterangan |
|---|---|
| Beranda | Jumlah karyawan aktif, sudah absen, dan belum absen hari ini |
| Data karyawan | Tambah, ubah, cari, dan filter karyawan |
| Nonaktifkan | *Soft delete*: akun tidak bisa login, riwayat absen tetap tersimpan |
| Monitoring absensi | Filter tanggal dan karyawan, lihat foto bukti. **Hanya bisa dilihat** |

---

## Tech stack

| Bagian | Teknologi | Kegunaan |
|---|---|---|
| Backend | **NestJS 10** (TypeScript, monorepo) | Kerangka program server |
| | **@nestjs/microservices** (TCP) | Komunikasi antara gateway dan tiga service |
| | **TypeORM** + migration | Akses database dan pembuatan tabel otomatis |
| | **JWT** + **bcrypt** | Token login dan enkripsi password |
| | **class-validator** | Validasi input dengan pesan Bahasa Indonesia |
| | **Multer** | Menerima upload foto |
| | **Swagger** | Dokumentasi API interaktif |
| Database | **MySQL 8** / MariaDB 10.4+ | Satu database untuk setiap service |
| Frontend | **React 18** + **Vite** (TypeScript) | Tampilan aplikasi |
| | **React Router** | Navigasi halaman dan pembatasan per peran |
| | **TanStack Query** + **Axios** | Pengambilan data dari API |
| | **React Hook Form** + **Zod** | Form dan validasinya |
| | **Tailwind CSS** | Styling dengan token warna dari desain |
| Kualitas kode | ESLint, Prettier, TypeScript strict | Pemeriksaan dan perapian kode |
| Desain | FigCraft | Rancangan 10 layar di folder `design/` |

---

## Arsitektur

```
┌──────────────────────────────────────────────────────────┐
│  Frontend · React + Vite                 localhost:5173  │
│  Portal Karyawan            Portal Admin HRD             │
└────────────────────────────┬─────────────────────────────┘
                             │  HTTP /api  + token JWT
┌────────────────────────────▼─────────────────────────────┐
│  API Gateway · NestJS                    localhost:3000  │
│  cek token · cek peran · validasi · simpan foto · Swagger│
└───────┬───────────────────┬────────────────────┬─────────┘
        │ TCP :4001         │ TCP :4002          │ TCP :4003
┌───────▼───────┐   ┌───────▼────────┐   ┌───────▼──────────┐
│ auth-service  │   │employee-service│   │attendance-service│
│ login, akun   │   │ data karyawan  │   │ absen, rekap     │
└───────┬───────┘   └───────┬────────┘   └───────┬──────────┘
        │                   │                    │
 presensiku_auth   presensiku_employee   presensiku_attendance
                          (MySQL)
```

| Komponen | Tugas |
|---|---|
| **API Gateway** | Satu-satunya pintu HTTP. Memeriksa token dan peran, memvalidasi input, menyimpan foto ke `backend/uploads/`, lalu meneruskan pesan ke service. |
| **auth-service** | Login, enkripsi password, pembuatan token, pengelolaan akun. |
| **employee-service** | Data master karyawan: tambah, ubah, cari, nonaktifkan. |
| **attendance-service** | Pencatatan absen dengan jam server, batas 1× per hari, rekap bulanan. |

Setiap service hanya mengakses database miliknya sendiri. Jika sebuah halaman butuh data dari dua service (misalnya daftar absensi beserta nama karyawan), gateway yang menggabungkannya.

### Alur absen

1. Karyawan mengirim foto dan catatan dari halaman Absen.
2. Gateway memeriksa token, lalu menyimpan foto dengan nama acak.
3. attendance-service mengambil jam dari server dan memastikan karyawan belum absen hari ini.
4. Jika lolos, absen disimpan dan layar menampilkan "Absen berhasil tercatat".
5. Jika sudah absen, permintaan ditolak dan foto yang baru diunggah langsung dihapus.

---

## Struktur proyek

```
dexa-wfh-attendance/
├── backend/                 Program server (NestJS)
│   ├── apps/
│   │   ├── gateway/             Pintu HTTP untuk frontend
│   │   ├── auth-service/        Login dan akun
│   │   ├── employee-service/    Data karyawan
│   │   └── attendance-service/  Absensi
│   ├── libs/common/         Kode bersama keempat program
│   └── database/            Pembuatan database dan data demo
├── frontend/                Website (React)
│   └── src/
│       ├── app/                 Titik awal dan peta halaman
│       ├── components/ui/       Komponen tampilan yang dipakai ulang
│       ├── layouts/             Bingkai halaman admin dan karyawan
│       ├── features/            Kode per fitur
│       ├── hooks/               Fungsi React yang dipakai ulang
│       ├── lib/                 Penghubung API dan format tanggal
│       └── types/               Bentuk data dari API
├── design/                  File desain FigCraft dan gambar layar
└── README.md
```

### Backend

<details>
<summary><b>backend/</b> (pengaturan)</summary>

| File | Kegunaan |
|---|---|
| `package.json` | Daftar library dan perintah (`start:dev`, `db:setup`, `seed`, …) |
| `nest-cli.json` | Mendaftarkan 4 program dan 1 pustaka bersama dalam monorepo |
| `tsconfig.json`, `tsconfig.build.json` | Aturan TypeScript untuk pengembangan dan build |
| `.env.example` | Contoh pengaturan: database, kunci JWT, port |
| `eslint.config.mjs`, `.prettierrc` | Aturan pemeriksaan dan perapian kode |

</details>

<details>
<summary><b>apps/gateway/src/</b> (pintu HTTP)</summary>

| File | Kegunaan |
|---|---|
| `main.ts` | Menyalakan server: prefix `/api`, CORS, validasi, Swagger, folder foto |
| `app.module.ts` | Menggabungkan semua modul dan memasang guard di setiap endpoint |
| `auth/auth.controller.ts` | Endpoint login dan profil |
| `auth/auth.service.ts` | Meneruskan login ke auth-service dan melengkapi data karyawan |
| `auth/decorators.ts` | `@Public`, `@Roles`, `@CurrentUser` |
| `auth/guards/jwt-auth.guard.ts` | Menolak permintaan tanpa token yang sah |
| `auth/guards/roles.guard.ts` | Menolak permintaan dari peran yang tidak berhak |
| `auth/dto/login.dto.ts` | Validasi form login |
| `employees/employees.controller.ts` | Endpoint data karyawan (khusus admin) |
| `employees/employees.service.ts` | Membuat karyawan + akun, rollback jika gagal, status absen hari ini |
| `employees/dto/employee.dto.ts` | Validasi form karyawan dan filter pencarian |
| `attendances/attendances.controller.ts` | Endpoint absen, riwayat, rekap, ringkasan, monitoring |
| `attendances/attendances.service.ts` | Mengirim absen ke service, menghapus foto jika ditolak, menambah nama karyawan |
| `attendances/photo-storage.config.ts` | Aturan simpan foto: JPG/PNG, maks. 2 MB, nama acak |
| `attendances/dto/attendance.dto.ts` | Validasi catatan, tanggal, dan bulan |
| `shared/service-client.ts` | Mengirim pesan ke tiga service dan menerjemahkan error |
| `shared/service-clients.module.ts` | Mendaftarkan alamat ketiga service |
| `shared/http-exception.filter.ts` | Menyeragamkan format pesan error |

</details>

<details>
<summary><b>apps/auth-service/src/</b> · <b>apps/employee-service/src/</b> · <b>apps/attendance-service/src/</b></summary>

Ketiga service punya susunan file yang sama:

| File | Kegunaan |
|---|---|
| `main.ts` | Menyalakan service di port 4001 / 4002 / 4003 |
| `*.module.ts` | Menghubungkan service ke database miliknya |
| `*.controller.ts` | Daftar pesan TCP yang bisa diterima |
| `*.service.ts` | Logika utama service |
| `*.entity.ts` | Bentuk tabel di database |
| `database/migrations/*.ts` | Pembuatan tabel beserta constraint dan index |

</details>

<details>
<summary><b>libs/common/src/</b> (kode bersama)</summary>

| File | Kegunaan |
|---|---|
| `constants/message-patterns.ts` | Nama pesan antar service, misalnya `attendance.check-in` |
| `constants/service-clients.ts` | Nama token klien untuk ketiga service |
| `contracts/*.ts` | Bentuk data yang dikirim antar service |
| `enums/index.ts` | `Role` (ADMIN/EMPLOYEE) dan `EmployeeStatus` (ACTIVE/INACTIVE) |
| `rpc/rpc-errors.ts` | Pembuat error yang dikirim service ke gateway |
| `utils/date.util.ts` | Tanggal dan jam zona Asia/Jakarta, hitung hari kerja |
| `config/database.config.ts` | Pengaturan koneksi MySQL |
| `config/microservice.config.ts` | Pengaturan koneksi TCP |

</details>

<details>
<summary><b>database/</b> (data demo)</summary>

| File | Kegunaan |
|---|---|
| `setup.ts` | Membuat 3 database (`npm run db:setup`) |
| `seed.ts` | Membuat tabel, lalu mengisi admin, 6 karyawan, dan riwayat absen (`npm run seed`) |
| `seed-photos/` | Foto contoh untuk riwayat absen |

</details>

### Frontend

<details>
<summary><b>frontend/</b> (pengaturan)</summary>

| File | Kegunaan |
|---|---|
| `index.html` | Halaman dasar dan pemuatan font Manrope |
| `vite.config.ts` | Port 5173, alias `@/`, proxy `/api` dan `/uploads` ke backend |
| `tailwind.config.js` | Token warna dan font sesuai desain |
| `tsconfig*.json` | Aturan TypeScript |
| `eslint.config.js`, `.prettierrc` | Aturan pemeriksaan dan perapian kode |

</details>

<details>
<summary><b>src/components/ui/</b> (komponen custom)</summary>

| File | Kegunaan |
|---|---|
| `Button.tsx` | Tombol dengan varian warna dan status loading |
| `Chip.tsx` | Label status dan tombol filter |
| `Avatar.tsx` | Lingkaran inisial nama |
| `TextField.tsx` | Kolom isian dan pilihan dengan pesan error |
| `DataTable.tsx` | Tabel generik dengan tampilan loading dan kosong |
| `Pagination.tsx` | Navigasi halaman |
| `Modal.tsx` | Jendela pop-up |
| `Toast.tsx`, `toast-context.ts` | Notifikasi singkat |
| `PhotoCapture.tsx` | Ambil foto dari kamera atau file, dengan pratinjau |
| `LiveClock.tsx` | Jam yang disinkronkan dengan server |
| `StatTile.tsx` | Kotak angka ringkasan |
| `InfoNote.tsx`, `Icon.tsx`, `Spinner.tsx`, `Brand.tsx` | Catatan, ikon, animasi memuat, logo |

</details>

<details>
<summary><b>src/features/</b> (halaman per fitur)</summary>

| Folder | Isi |
|---|---|
| `auth/` | Halaman login, penyimpanan sesi, penjaga rute per peran |
| `attendance/` | Halaman Absen WFH dan Riwayat, form foto, pop-up foto |
| `employees/` | Tabel karyawan, form tambah/edit, dialog nonaktifkan |
| `monitoring/` | Beranda admin, monitoring absensi, panel detail |

Setiap folder fitur berisi `*-api.ts` (pemanggilan API), `*-queries.ts` (pengambilan data), halaman, dan folder `components/` untuk komponen khusus fitur tersebut.

</details>

<details>
<summary><b>src/app · layouts · hooks · lib · types</b></summary>

| File | Kegunaan |
|---|---|
| `app/App.tsx` | Provider: React Query, notifikasi, sesi login |
| `app/router.tsx` | Daftar halaman dan pembatasan per peran |
| `layouts/AdminLayout.tsx` | Header, bar jadwal WFH, dan menu samping admin |
| `layouts/EmployeeLayout.tsx` | Header dan tab halaman karyawan |
| `layouts/*PageHeader.tsx` | Judul halaman beserta ringkasan status |
| `hooks/use-server-clock.ts` | Jam yang dikoreksi agar sama dengan server |
| `hooks/use-debounced-value.ts` | Menunda pencarian sampai pengguna selesai mengetik |
| `lib/api-client.ts` | Axios dengan token otomatis dan penanganan error |
| `lib/datetime.ts` | Format tanggal dan jam WIB |
| `lib/token-storage.ts` | Menyimpan token login di browser |
| `types/api.ts` | Tipe data respons API |

</details>

---

## Struktur database

| Database · tabel | Kolom penting | Constraint / index |
|---|---|---|
| `presensiku_auth.users` | email, password_hash, role, employee_id, is_active | UNIQUE email, UNIQUE employee_id |
| `presensiku_employee.employees` | employee_code (NIK), full_name, email, phone, position, department, join_date, status | UNIQUE employee_code, UNIQUE email, INDEX full_name, INDEX (status, department) |
| `presensiku_attendance.attendances` | employee_id, attendance_date, check_in_at, photo_path, notes | **UNIQUE (employee_id, attendance_date)**, INDEX attendance_date |

- Tabel dibuat oleh **migration** saat `npm run seed` atau saat service pertama kali menyala.
- Kolom `check_in_at` disimpan dalam **UTC**. Aplikasi menampilkannya dalam WIB (UTC+7).
- Foto disimpan di `backend/uploads/attendance/`. Database hanya menyimpan alamat filenya.

---

## Menjalankan secara lokal

### Prasyarat

| Program | Versi | Keterangan |
|---|---|---|
| **Node.js** | 20 atau lebih baru | Sudah termasuk `npm` · https://nodejs.org |
| **MySQL** | 8.x atau MariaDB 10.4+ | Pilih salah satu: **XAMPP**, **Laragon**, atau **MySQL Installer** |
| **Git** | terbaru | Hanya jika mengambil proyek dari GitHub |

Pastikan MySQL **sudah menyala** sebelum mulai. Di XAMPP: buka *XAMPP Control Panel*, lalu klik **Start** pada baris MySQL.

### Langkah 1 — Atur koneksi database

```bash
cd backend
cp .env.example .env
```

Sesuaikan isi `backend/.env` dengan MySQL di komputermu:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
JWT_SECRET=ganti-dengan-string-acak-yang-panjang
```

`DB_PASSWORD` dibiarkan kosong untuk XAMPP dan Laragon. Isi jika user root MySQL-mu memakai password.

### Langkah 2 — Siapkan database dan data demo (sekali saja)

```bash
cd backend
npm install
npm run db:setup
npm run seed
```

| Perintah | Hasil |
|---|---|
| `npm run db:setup` | Membuat database `presensiku_auth`, `presensiku_employee`, `presensiku_attendance` |
| `npm run seed` | Membuat tabel, lalu mengisi 1 admin, 6 karyawan, dan riwayat absen |

Kedua perintah aman dijalankan ulang; data tidak akan dobel.

### Langkah 3 — Jalankan backend

```bash
cd backend
npm run start:dev
```

Empat proses menyala bersamaan. Tunggu sampai muncul:

```
API gateway on http://localhost:3000/api (docs: /api/docs)
```

Biarkan terminal ini tetap terbuka.

### Langkah 4 — Jalankan frontend (terminal baru)

```bash
cd frontend
npm install
npm run dev
```

Buka **http://localhost:5173** di browser.

### Pemakaian berikutnya

| Urutan | Yang dilakukan |
|---|---|
| 1 | Nyalakan MySQL (XAMPP → Start) |
| 2 | `cd backend` → `npm run start:dev` |
| 3 | Terminal baru: `cd frontend` → `npm run dev` |
| 4 | Buka http://localhost:5173 |

Untuk berhenti: tekan `Ctrl+C` di kedua terminal, lalu klik **Stop** pada MySQL di XAMPP.

### Alamat dan port

| Port | Proses | Keterangan |
|---|---|---|
| 5173 | Frontend | Halaman aplikasi |
| 3000 | API Gateway | `/api` (endpoint), `/api/docs` (Swagger), `/uploads` (foto) |
| 4001 | auth-service | TCP, hanya diakses gateway |
| 4002 | employee-service | TCP, hanya diakses gateway |
| 4003 | attendance-service | TCP, hanya diakses gateway |
| 3306 | MySQL | Database |

### Melihat data dengan DBeaver

Buat koneksi **MySQL** dengan host `localhost`, port `3306`, user `root`, password kosong, dan kolom database dikosongkan. Jika muncul error *Public Key Retrieval is not allowed*, tambahkan driver property `allowPublicKeyRetrieval=true` dan `useSSL=false`.

---

## Akun demo

| Peran | Email | Password |
|---|---|---|
| Admin HRD | `admin@presensiku.test` | `Admin123!` |
| Karyawan | `budi.santoso@presensiku.test` | `Karyawan123!` |
| Karyawan | `rina.wulandari@presensiku.test` | `Karyawan123!` |
| Karyawan | `sari.putri@presensiku.test` | `Karyawan123!` |
| Karyawan | `dimas.pratama@presensiku.test` | `Karyawan123!` |
| Karyawan | `andi.wijaya@presensiku.test` | `Karyawan123!` |
| Karyawan (nonaktif) | `lestari.ayu@presensiku.test` | `Karyawan123!` — sengaja ditolak saat login |

---

## API

Dokumentasi interaktif: **http://localhost:3000/api/docs**

### Auth

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/api/auth/login` | publik | Login; mengembalikan token dan profil |
| GET | `/api/auth/me` | semua | Profil pengguna yang sedang login |

### Absensi

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/api/attendances` | Karyawan | Absen (multipart: `photo`, `notes`) |
| GET | `/api/attendances/today` | Karyawan | Status absen hari ini dan jam server |
| GET | `/api/attendances/me?month=YYYY-MM` | Karyawan | Riwayat absen sendiri |
| GET | `/api/attendances/stats?month=&employeeId=` | semua | Rekap bulanan |
| GET | `/api/attendances/summary?date=` | Admin | Jumlah aktif, sudah absen, belum absen |
| GET | `/api/attendances?from=&to=&employeeId=` | Admin | Monitoring absensi (view only) |

### Karyawan

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/employees?search=&status=&department=` | Admin | Daftar karyawan + status absen hari ini |
| GET | `/api/employees/:id` | Admin | Detail karyawan |
| POST | `/api/employees` | Admin | Tambah karyawan sekaligus akun login |
| PATCH | `/api/employees/:id` | Admin | Ubah karyawan; password opsional untuk reset |
| DELETE | `/api/employees/:id` | Admin | Nonaktifkan (soft delete) |

Tidak ada endpoint untuk mengubah atau menghapus absensi. Semua error memakai format:

```json
{ "statusCode": 409, "message": "Anda sudah absen hari ini pukul 08:02 WIB", "path": "/api/attendances", "timestamp": "..." }
```

---

## Aturan bisnis

| Aturan | Penerapan |
|---|---|
| Jam absen dari server | `check_in_at` diisi attendance-service; nilai dari klien diabaikan |
| Satu absen per hari | Dicek di attendance-service dan dijaga `UNIQUE (employee_id, attendance_date)` |
| Foto wajib | JPG/PNG maks. 2 MB, divalidasi di frontend dan backend; foto yang ditolak dihapus |
| Kamera atau upload | Kamera jadi pilihan utama; upload tetap ada untuk perangkat tanpa webcam |
| Karyawan + akun dibuat bersamaan | Jika pembuatan akun gagal, data karyawan di-rollback |
| Soft delete | Status `INACTIVE`, akun dikunci, riwayat absen tetap tersimpan |
| Absensi view only | Admin hanya bisa melihat; tidak ada ubah atau hapus |

---

## Masalah yang sering muncul

| Pesan | Penyebab | Solusi |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:3306` | MySQL belum menyala | Klik **Start** pada MySQL di XAMPP |
| `Access denied for user 'root'` | Password tidak cocok | Sesuaikan `DB_PASSWORD` di `backend/.env` |
| `Port 3000/5173 is already in use` | Aplikasi masih berjalan di terminal lain | Tutup terminal tersebut atau tekan `Ctrl+C` |
| Halaman login muncul tapi gagal masuk | Backend belum menyala atau seed belum dijalankan | Jalankan `npm run start:dev` dan `npm run seed` |
| `Public Key Retrieval is not allowed` (DBeaver) | Pengaturan driver | Tambah `allowPublicKeyRetrieval=true`, `useSSL=false` |

---

## Membagikan lewat GitHub

### File yang tidak ikut terunggah

Diatur oleh `.gitignore`:

| Diabaikan | Alasan |
|---|---|
| `node_modules/` | Dibuat ulang dengan `npm install` |
| `dist/` | Hasil build, dibuat ulang otomatis |
| `backend/.env` | Berisi password dan kunci rahasia |
| `backend/uploads/` | Foto absen pengguna |

### Mengunggah (oleh pemilik proyek)

1. Buat repo kosong di https://github.com/new.
2. Jalankan dari folder proyek:

```bash
git add .
git commit -m "PresensiKu: absensi WFH dan monitoring karyawan"
git branch -M main
git remote add origin https://github.com/<username>/<nama-repo>.git
git push -u origin main
```

### Menjalankan dari GitHub (oleh orang lain)

1. Pasang **Node.js 20+**, **MySQL** (XAMPP/Laragon/MySQL Installer), dan **Git**.
2. Ambil proyek:
   ```bash
   git clone https://github.com/<username>/<nama-repo>.git
   cd <nama-repo>
   ```
3. Nyalakan MySQL, lalu ikuti [Langkah 1–4](#menjalankan-secara-lokal).

---

## Daftar script

### Backend (`cd backend`)

| Script | Fungsi |
|---|---|
| `npm run db:setup` | Membuat 3 database |
| `npm run seed` | Membuat tabel dan data demo |
| `npm run start:dev` | Menjalankan 4 service dalam mode pengembangan |
| `npm run build` | Membuat versi jadi di `dist/` |
| `npm run start:prod` | Menjalankan versi jadi |
| `npm run lint` | Memeriksa kode |
| `npm run typecheck` | Memeriksa tipe TypeScript |
| `npm run format` | Merapikan kode |

### Frontend (`cd frontend`)

| Script | Fungsi |
|---|---|
| `npm run dev` | Menjalankan website di http://localhost:5173 |
| `npm run build` | Membuat versi jadi di `dist/` |
| `npm run preview` | Melihat hasil build |
| `npm run lint` | Memeriksa kode |
| `npm run typecheck` | Memeriksa tipe TypeScript |
| `npm run format` | Merapikan kode |
