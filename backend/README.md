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

Lalu jalankan ketiga app di terminal terpisah:

```bash
npm run dev:auth
npm run dev:core
npm run dev:gateway
```

Masing-masing berjalan dengan watch mode, jadi perubahan file langsung dimuat ulang. Cek dengan `curl http://localhost:3000/health`, `:3001/health`, dan `:3002/health`.

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
| `npm run dev:<app>` | jalankan app dengan watch mode |
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
| GET | `/health` | publik | status gateway |

## Catatan desain

- Satu database dipakai bersama karena `attendances` butuh relasi ke `users`. Kepemilikan tabel tetap dipisah: `users` hanya ditulis `auth-service`, `attendances` hanya ditulis `core-service`. Kalau nanti service perlu diskalakan terpisah, relasi bisa diganti pemanggilan API antar service.
- Migrasi dijalankan per service sesuai tabel yang dimiliki, urutannya `auth` lalu `core` karena ada foreign key.
- Absensi dibatasi satu kali per hari per karyawan lewat unique index `user_id + attendance_date`.
