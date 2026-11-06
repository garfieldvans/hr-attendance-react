# Backend

Backend aplikasi absensi: satu gateway dan dua service NestJS dengan MySQL.

## Struktur

```
apps/
  api-gateway/    pintu masuk request dari frontend, validasi JWT, proxy ke service
  auth-service/   login, profil, data karyawan (tabel users)
  core-service/   absensi dan monitoring (tabel attendances)
libs/common/      enum dan konfigurasi yang dipakai bersama
```

`api-gateway` berjalan di port 3000, `auth-service` di 3001, dan `core-service` di 3002.

## Stack

NestJS 11, TypeORM, MySQL 8, JWT, bcrypt.

## Menjalankan

```bash
docker compose up -d
cp .env.example .env
npm install
npm run migrate:auth
npm run migrate:core
npm run seed
```

Lalu jalankan semua service sekaligus:

```bash
npm run dev
```

Perintah ini menyalakan gateway (`:3000`), auth (`:3001`), dan core (`:3002`) dengan watch mode serta prefix log per service. Kalau MySQL belum menerima koneksi di `DB_HOST:DB_PORT`, script otomatis menjalankan `docker compose up -d` lebih dulu dan menunggu sampai siap. Ctrl+C mematikan ketiga service sekaligus. Untuk menjalankan satu app saja, pakai `npm run dev:auth`, `npm run dev:core`, atau `npm run dev:gateway`. Cek dengan `curl http://localhost:3000/health`, `:3001/health`, dan `:3002/health`.

Untuk mode produksi:

```bash
npm run build
npm run start:auth
npm run start:core
npm run start:gateway
```

## Script

| Script | Kegunaan |
| --- | --- |
| `npm run dev` | jalankan gateway, auth, dan core sekaligus (sekaligus menyiapkan MySQL) |
| `npm run dev:<app>` | jalankan satu app dengan watch mode |
| `npm run build` | kompilasi semua app ke `dist/` |
| `npm run typecheck` | cek tipe tanpa menghasilkan file |
| `npm run migrate:auth` | migrasi tabel `users` |
| `npm run migrate:core` | migrasi tabel `attendances` |
| `npm run seed` | isi 4 akun awal |

## Endpoint

Semua request dari frontend masuk lewat gateway.

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | publik | mengembalikan `accessToken` dan data user |
| GET | `/api/auth/profile` | bearer token | profil user yang sedang login |
| GET | `/api/users` | HRD | daftar karyawan, bisa difilter `q`, `role`, `isActive`, dengan pagination `page` dan `limit` |
| GET | `/api/users/:id` | HRD | detail karyawan |
| POST | `/api/users` | HRD | tambah karyawan, password minimal 8 karakter |
| PATCH | `/api/users/:id` | HRD | ubah data karyawan, termasuk password dan status aktif |
| DELETE | `/api/users/:id` | HRD | hapus karyawan, ditolak bila sudah punya data absensi |
| POST | `/api/attendances` | karyawan | kirim absensi, `multipart/form-data` dengan `photo` (JPG/PNG/WebP, maks 5 MB) dan `notes` opsional; `workType` selalu `WFH` |
| PATCH | `/api/attendances/me/check-out` | karyawan | absen pulang hari ini; ditolak bila belum absen masuk atau sudah absen pulang |
| GET | `/api/attendances/me` | bearer token | riwayat absensi sendiri, bisa difilter `from` dan `to` (`YYYY-MM-DD`) |
| GET | `/api/attendances` | HRD | monitoring absensi hari ini, difilter `from`, `to`, `q`, `userId`, dengan pagination `page` dan `limit` |
| GET | `/api/files/...` | publik | file foto absensi |
| GET | `/health` | publik | status gateway |

## Catatan desain

- Satu database dipakai bersama karena `attendances` butuh relasi ke `users`. Kepemilikan tabel tetap dipisah: `users` hanya ditulis `auth-service`, `attendances` hanya ditulis `core-service`. Kalau nanti service perlu diskalakan terpisah, relasi bisa diganti pemanggilan API antar service.
- Migrasi dijalankan per service sesuai tabel yang dimiliki, urutannya `auth` lalu `core` karena ada foreign key.
- Absensi dibatasi satu kali per hari per karyawan lewat unique index `user_id + attendance_date`.
- Foreign key absensi memakai `ON DELETE RESTRICT` supaya riwayat absensi tidak ikut terhapus saat karyawan dihapus. Karyawan yang sudah pernah absen sebaiknya dinonaktifkan (`isActive: false`), bukan dihapus.
- Endpoint karyawan hanya bisa diakses role HRD lewat `RolesGuard`; karyawan biasa mendapat 403.
- Absensi hanya bisa dikirim role karyawan dan selalu bertipe WFH, sesuai use case absensi WFH. HRD bersifat baca saja: hanya punya akses monitoring, tanpa endpoint untuk mengubah atau menghapus data absensi.
- Akun HRD tetap tersimpan di tabel `users`, tetapi tidak ikut ditampilkan pada pengelolaan data karyawan di frontend (`GET /api/users` dengan filter `role`).
- Absensi menyimpan tanggal dan jam dari server. Tanggal kehadiran dihitung dengan zona `APP_TIMEZONE` (default `Asia/Jakarta`), jadi absen jam 00.30 WIB tercatat pada hari yang benar.
- Absen pulang hanya mengisi `check_out_at` pada baris absensi hari itu, sehingga tetap satu baris per hari. Kolom ini nullable: bila karyawan tidak absen pulang, nilainya `null` dan ditampilkan sebagai "Belum absen pulang".
- Foto disimpan di `UPLOAD_DIR` (default `uploads/attendances/<tanggal>/`) dan disajikan `core-service` lewat `/files`, lalu diteruskan gateway sebagai `/api/files/...`. Nama file memakai UUID supaya tidak bisa ditebak.
- Endpoint daftar karyawan dan monitoring mengembalikan `{ items, meta }` dengan `page` (default 1) dan `limit` (default 10, maksimal 50), jadi `total` dan `totalPages` sudah dihitung server. Filter `q` pada monitoring menyaring berdasarkan nama atau kode karyawan.
- Operasi baca (login, profil, daftar karyawan, absensi, monitoring) memakai query SQL langsung lewat `DataSource.query`; penulisan data tetap lewat repository TypeORM agar validasi dan relasi aman.
