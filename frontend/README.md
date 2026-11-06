# Frontend

Antarmuka aplikasi absensi: login, absen masuk dengan foto, riwayat absensi, dan halaman monitoring untuk HRD.

## Stack

React 19 + TypeScript, Vite, Tailwind CSS 4, React Router, Axios. Semua request diarahkan ke `api-gateway` di port 3000.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Backend harus sudah berjalan lebih dulu (lihat [../backend/README.md](../backend/README.md)).

Akun untuk mencoba:

| Email | Password | Role |
| --- | --- | --- |
| hrd@attendance.test | Password123! | HRD |
| budi@attendance.test | Password123! | Employee |

Tombol **HRD** dan **Karyawan** di halaman login mengisi kredensial di atas otomatis.

## Script

| Script | Kegunaan |
| --- | --- |
| `npm run dev` | jalankan dev server |
| `npm run build` | cek tipe lalu build ke `dist/` |
| `npm run preview` | jalankan hasil build |
| `npm run typecheck` | cek tipe tanpa build |

## Struktur

```
src/
  components/   komponen reusable (Button, Input, Badge, Card, AppLayout, PhotoCapture, EmployeeDialog)
  pages/        halaman (login, beranda, absensi, monitoring, data karyawan, detail karyawan)
  services/     pemanggilan API dan penyimpanan sesi
  hooks/        AuthProvider dan useAuth
  lib/          helper format tanggal dan jam
  types.ts      tipe data bersama
```

## Alur data

- `services/http.ts` membuat instance Axios dengan `baseURL: '/api'` dan menyisipkan token dari sesi ke header `Authorization`.
- Selama development, Vite mem-proxy `/api` ke `http://localhost:3000` (lihat `vite.config.ts`), jadi browser tidak perlu konfigurasi CORS.
- Sesi login disimpan di `localStorage` lewat `services/session.ts`. Respons 401 menghapus sesi dan mengarahkan pengguna kembali ke halaman login.
- Pesan error dari backend ditampilkan apa adanya, termasuk validasi per field.
- Monitoring dan data karyawan memuat 10 baris per halaman lewat parameter `page` dan `limit`; posisi halaman ikut direset saat filter atau kata kunci berubah, dan kembali ke halaman sebelumnya bila baris terakhir pada halaman itu dihapus.
- Data karyawan bisa disaring berdasarkan kata kunci (nama, kode, email) dan status aktif, lalu digabung dengan pagination; jumlah baris di footer mengikuti hasil filter.
- Halaman detail karyawan (`/karyawan/:id`) mengambil profil dari `GET /api/users/:id` dan 5 absensi terbaru dari `GET /api/attendances?userId=...`. Nama karyawan di tabel monitoring dan data karyawan menjadi tautan ke halaman ini.

## Kamera

Foto absensi diambil lewat `getUserMedia` lalu dikirim sebagai `multipart/form-data`. Browser hanya mengizinkan kamera di origin aman, jadi pakai `localhost` saat development atau HTTPS saat deploy. Jika kamera ditolak atau tidak tersedia, pengguna tetap bisa mengunggah file JPG/PNG/WebP (maksimal 5 MB).
