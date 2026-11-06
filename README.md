# HR Attendance

Aplikasi absensi WFH dan monitoring karyawan. Backend dan frontend berada di satu repository tetapi berdiri sebagai dua project terpisah, masing-masing punya dependency dan cara jalan sendiri.

## Fitur

**Karyawan**

- Login, lalu absen masuk WFH sekali sehari dengan foto bukti kerja dan catatan opsional, serta absen pulang saat selesai bekerja.
- Melihat riwayat absensi sendiri beserta status masuk dan pulang hari ini.

**HRD**

- Monitoring absensi seluruh karyawan: filter rentang tanggal dan pencarian nama, kode, atau email, pratinjau foto, dengan pagination 10 baris per halaman.
- Membuka detail karyawan berisi profil lengkap dan 5 absensi terbaru.
- Mengelola data karyawan: tambah, ubah, hapus, cari, filter status aktif, dengan pagination 10 baris per halaman.
- Data absensi bersifat baca saja, tidak ada aksi ubah atau hapus.

## Aturan absensi

- Hanya role karyawan yang bisa mengirim absensi; HRD mendapat 403 dan menu Absensi tidak muncul untuk HRD.
- Satu absensi per hari: satu absen masuk, lalu satu absen pulang pada baris yang sama. Tanggal dan jam diambil dari server memakai zona `APP_TIMEZONE` (default `Asia/Jakarta`).
- Absen pulang tidak wajib. Kalau karyawan lupa, jam pulang dibiarkan kosong dan statusnya tampil sebagai "Belum absen pulang" di halaman absensi maupun monitoring HRD.
- Tipe kerja selalu WFH.
- Foto wajib diunggah (JPG/PNG/WebP, maksimal 5 MB), bisa lewat kamera atau pilih file.
- Tidak ada registrasi mandiri. Akun karyawan dibuat HRD, dan akun HRD tidak ikut tampil di daftar karyawan.

## Struktur

```
backend/    NestJS + MySQL, terdiri dari gateway dan dua service
frontend/   React + Vite
```

Panduan lengkap tiap project ada di [backend/README.md](backend/README.md) dan [frontend/README.md](frontend/README.md).

## Arsitektur singkat

```
React  ->  api-gateway :3000  ->  auth-service :3001   (users, login, profil)
                              ->  core-service :3002   (absensi, monitoring)
```

- `api-gateway` menjadi satu-satunya pintu masuk dari browser, memvalidasi JWT, lalu meneruskan request ke service tujuan.
- Setiap service tetap memvalidasi JWT sendiri, jadi service tidak bergantung pada gateway untuk urusan otorisasi.
- Database MySQL dipakai bersama karena absensi butuh relasi ke data karyawan, sementara penulisan tiap tabel tetap hanya dilakukan oleh service pemiliknya.

## Prasyarat

- Node.js 20 atau lebih baru.
- Docker, hanya untuk MySQL. Backend dan frontend dijalankan langsung dengan Node.

## Menjalankan

Database:

```bash
cd backend
docker compose up -d        # MySQL 8.4 di localhost:3306, database attendance_db
```

Backend, dari folder `backend`:

```bash
cp .env.example .env
npm install
npm run migrate:auth && npm run migrate:core
npm run seed
npm run dev           # gateway :3000, auth :3001, core :3002
```

Frontend, dari folder `frontend`:

```bash
npm install
npm run dev           # http://localhost:5173
```

Cek kesiapan backend dengan `curl http://localhost:3000/health` (port 3001 dan 3002 juga punya `/health`).

## Akun demo

Hasil `npm run seed`, semuanya memakai password `Password123!`:

| Email | Role |
| --- | --- |
| hrd@attendance.test | HRD |
| budi@attendance.test | Karyawan |
| sari@attendance.test | Karyawan |
| agus@attendance.test | Karyawan |

Tombol **HRD** dan **Karyawan** di halaman login mengisi kredensial di atas otomatis.

## Catatan

- Foto absensi tersimpan di `backend/uploads/attendances/<tanggal>/` dan disajikan lewat gateway di `/api/files/...`. Foto tidak ikut masuk git.
- Data MySQL disimpan di volume Docker `hr-attendance_mysql-data`, jadi `docker compose down` tidak menghapus data. Gunakan `docker compose down -v` kalau ingin mulai dari database kosong, lalu jalankan migrasi dan seed lagi.
- Karyawan yang sudah punya riwayat absensi tidak bisa dihapus (foreign key `RESTRICT`); nonaktifkan lewat status aktif agar tidak bisa login.
