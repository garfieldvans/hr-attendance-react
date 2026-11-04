# Frontend

Antarmuka aplikasi absensi: login, absen masuk dengan foto, riwayat absensi, dan halaman monitoring untuk HRD.

## Stack

React + Vite, React Router, Axios. Semua request diarahkan ke `api-gateway` di port 3000.

## Menjalankan

```bash
npm install
npm run dev
```

Backend harus sudah berjalan lebih dulu (lihat [../backend/README.md](../backend/README.md)).

## Struktur

```
src/
  components/   komponen reusable
  pages/        halaman
  services/     pemanggilan API
  hooks/        state dan logic yang dipakai lintas halaman
```
