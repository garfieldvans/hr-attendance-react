# HR Attendance

Aplikasi absensi WFH dan monitoring karyawan. Backend dan frontend berada di satu repository tetapi berdiri sebagai dua project terpisah, masing-masing punya dependency dan cara jalan sendiri.

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

## Menjalankan

```bash
cd backend
docker compose up -d
cp .env.example .env
npm install
npm run migrate:auth && npm run migrate:core
npm run seed
npm run dev:auth      # terminal 1
npm run dev:core      # terminal 2
npm run dev:gateway   # terminal 3
```

Lalu jalankan frontend dari terminal lain:

```bash
cd frontend
npm install
npm run dev
```

Akun untuk mencoba:

| Email | Password | Role |
| --- | --- | --- |
| hrd@attendance.test | Password123! | HRD |
| budi@attendance.test | Password123! | Employee |
| sari@attendance.test | Password123! | Employee |
| agus@attendance.test | Password123! | Employee |
