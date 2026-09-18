# Sistem Prestasi

Platform Next.js untuk pencatatan, verifikasi, dan rekap prestasi mahasiswa dan dosen.

## Menjalankan aplikasi

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Halaman publik yang tersedia: `/`, `/ajukan`, `/status`, dan `/login`. Dashboard demo dapat dibuka melalui `/dashboard`.

## Supabase

1. Salin `.env.example` menjadi `.env.local`, lalu isi URL, anon key, service role key, dan kredensial Resend.
2. Jalankan seluruh isi [`db/scheme.sql`](./db/scheme.sql) melalui Supabase SQL Editor atau `supabase db push`.
3. Buat akun admin melalui Supabase Dashboard > Authentication > Users, lalu tambahkan UUID akun tersebut ke tabel `profil_internal` dengan role `ADMIN`.

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh digunakan di server/API Route. Jangan pernah menaruhnya di komponen client atau meng-commit nilai aslinya.
