Prompt Vibe Coding: Sistem Pencatatan & Verifikasi Prestasi Dosen dan Mahasiswa
Catatan: draft ini menggunakan stack Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Database, Auth, Storage). Supabase Auth dipakai khusus untuk akun internal (verifikator/admin) — pelapor (mahasiswa/dosen) tetap tidak memakai akun, cukup NIM/NIP + OTP kustom seperti dirancang sebelumnya.

Buatkan saya aplikasi web bernama "Sistem Prestasi" — platform untuk mencatat, memverifikasi, dan merekap prestasi dosen dan mahasiswa di sebuah kampus. Berikut spesifikasi lengkapnya:

1. Ringkasan Aplikasi
Aplikasi ini memungkinkan mahasiswa dan dosen mengajukan laporan prestasi (lomba, publikasi, penghargaan, sertifikasi, dll) tanpa perlu membuat akun. Identitas pelapor divalidasi melalui NIM/NIP yang dicocokkan ke data master yang sudah ada di database, lalu dikonfirmasi lewat kode OTP yang dikirim ke email kampus resmi milik NIM/NIP tersebut. Verifikator (dosen/staf dengan akun) meninjau dan menyetujui/menolak/meminta revisi setiap pengajuan melalui dashboard admin.

2. Tech Stack
Framework: Next.js 14+ (App Router), TypeScript
Styling: Tailwind CSS
Database: Supabase (PostgreSQL terkelola), diakses lewat @supabase/supabase-js (dan @supabase/ssr untuk integrasi App Router)
Autentikasi verifikator/admin: Supabase Auth (email + password). Akun-akun ini dibuat manual/oleh admin lewat Supabase Dashboard atau lewat halaman "Kelola Pengguna" — bukan pendaftaran mandiri publik.
Pelapor (mahasiswa/dosen): TIDAK memakai Supabase Auth sama sekali. Identitas mereka divalidasi lewat NIM/NIP + OTP kustom (disimpan di tabel biasa, bukan lewat sistem auth Supabase), karena mereka tidak butuh sesi login.
Bukti lampiran: TIDAK menggunakan Supabase Storage. Pelapor cukup menempelkan link Google Drive (file yang sudah di-share dengan akses "siapa saja yang punya link dapat melihat") pada form pengajuan. Sistem hanya menyimpan URL tersebut ke database, tidak meng-upload/menyalin file.
Keamanan tingkat baris: Row Level Security (RLS) Supabase untuk membatasi akses data (lihat §3.1)
Pengiriman email OTP & notifikasi: Resend atau Supabase Edge Function + SMTP pihak ketiga (OTP publik ini terpisah dari Supabase Auth's built-in OTP, karena dipakai untuk memverifikasi NIM/NIP, bukan login akun)
Validasi form: Zod + React Hook Form
3. Model Data (Skema Tabel Supabase/PostgreSQL)
Buatkan migrasi SQL (via Supabase CLI atau SQL editor) dengan tabel-tabel berikut:

-- Fakultas
create table fakultas (
  id uuid primary key default gen_random_uuid(),
  nama text unique not null,
  kode text unique
);

-- Program studi (setiap prodi berada di bawah satu fakultas)
create table prodi (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  kode text unique,
  fakultas_id uuid references fakultas(id) not null,
  unique (nama, fakultas_id)
);

-- Data master mahasiswa & dosen
create table master_akademik (
  id uuid primary key default gen_random_uuid(),
  nim_nip text unique not null,
  nama text not null,
  jenis text not null check (jenis in ('MAHASISWA', 'DOSEN')),
  prodi_id uuid references prodi(id) not null,
  email_kampus text not null,
  status_aktif boolean default true,
  created_at timestamptz default now()
);
Catatan: fakultas otomatis didapat lewat relasi master_akademik.prodi_id → prodi.fakultas_id, jadi tidak perlu kolom fakultas terpisah di master_akademik (hindari data duplikat/tidak konsisten). Untuk query rekap per fakultas, join lewat prodi.


-- Kategori prestasi (dikelola admin)
create table kategori_prestasi (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  tingkat_default text,
  bobot_poin integer default 0,
  aktif boolean default true
);

-- Pengajuan prestasi
create table pengajuan (
  id uuid primary key default gen_random_uuid(),
  kode_tiket text unique not null,
  master_akademik_id uuid references master_akademik(id) not null,
  kategori_id uuid references kategori_prestasi(id) not null,
  judul text not null,
  deskripsi text,
  tingkat text not null check (tingkat in ('LOKAL', 'NASIONAL', 'INTERNASIONAL')),
  tanggal_kegiatan date not null,
  penyelenggara text,
  peran text check (peran in ('INDIVIDU', 'TIM')),
  status text not null default 'MENUNGGU' check (status in ('MENUNGGU', 'DIREVISI', 'DITERIMA', 'DITOLAK')),
  catatan_verifikator text,
  verifikator_id uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Lampiran bukti (berupa link Google Drive, bukan file yang di-upload ke sistem)
create table bukti_lampiran (
  id uuid primary key default gen_random_uuid(),
  pengajuan_id uuid references pengajuan(id) on delete cascade,
  nama_bukti text not null,
  link_drive text not null,
  created_at timestamptz default now()
);

-- OTP untuk verifikasi identitas pelapor (bukan Supabase Auth)
create table otp_verifikasi (
  id uuid primary key default gen_random_uuid(),
  master_akademik_id uuid references master_akademik(id) not null,
  kode_otp_hash text not null,
  kedaluwarsa_at timestamptz not null,
  terpakai boolean default false,
  created_at timestamptz default now()
);

-- Log audit setiap aksi verifikasi
create table log_verifikasi (
  id uuid primary key default gen_random_uuid(),
  pengajuan_id uuid references pengajuan(id) not null,
  verifikator_id uuid references auth.users(id) not null,
  aksi text not null,
  catatan text,
  created_at timestamptz default now()
);

-- Profil tambahan untuk user Supabase Auth (role & scope prodi)
create table profil_internal (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  role text not null check (role in ('VERIFIKATOR', 'ADMIN')),
  prodi_scope_id uuid references prodi(id)
);
3.1 Row Level Security (RLS)
Aktifkan RLS di semua tabel. Aturan intinya:

master_akademik, pengajuan, bukti_lampiran, otp_verifikasi: tidak boleh diakses langsung dari client dengan anon key. Semua operasi (lookup NIM/NIP, submit pengajuan, cek status, kirim/verifikasi OTP) dilakukan lewat Next.js API Route / Supabase Edge Function yang memakai service role key di sisi server, supaya logika validasi (OTP, rate limit) tidak bisa dilewati dari browser.
pengajuan (untuk dashboard): verifikator dengan role VERIFIKATOR hanya boleh select/update baris yang prodi_id di master_akademik terkait cocok dengan prodi_scope_id miliknya (lewat join policy atau view). Role ADMIN punya akses penuh.
profil_internal: user hanya boleh membaca profilnya sendiri; hanya admin yang boleh insert/update baris siapa pun.
fakultas, prodi: publik boleh select (untuk dropdown di form pengajuan dan halaman kelola pengguna), hanya admin yang boleh insert/update/delete.
kategori_prestasi: publik boleh select (untuk dropdown di form pengajuan), hanya admin yang boleh insert/update/delete.
Untuk keperluan development awal, buatkan juga seed data: minimal 3 fakultas dengan 2–3 prodi masing-masing, 10 data master mahasiswa dan 5 data master dosen (dummy, tersebar di beberapa prodi), beberapa kategori prestasi (mis. "Juara Lomba", "Publikasi Jurnal", "Sertifikasi Kompetensi", "Penghargaan"), dan 1 akun admin default (dibuat lewat Supabase Auth + baris profil_internal dengan role ADMIN).

4. Alur & Halaman yang Harus Dibuat
4.1 Halaman Publik (tanpa login)
/ — Landing page Penjelasan singkat aplikasi + tombol "Ajukan Prestasi" dan "Cek Status Pengajuan".

/ajukan — Form pengajuan prestasi (multi-step)

Step 1 — Identitas: input NIM/NIP → panggil API lookup ke MasterAkademik → tampilkan nama & unit (read-only) jika ditemukan, tampilkan error jika tidak ditemukan.
Step 2 — Verifikasi OTP: tombol "Kirim OTP" → generate kode 6 digit, simpan ke tabel OtpVerifikasi dengan kedaluwarsa 10 menit, kirim ke email kampus. Input OTP + tombol verifikasi.
Step 3 — Detail Prestasi: form dengan field kategori (dropdown dari kategori_prestasi), judul, deskripsi, tingkat, tanggal kegiatan, penyelenggara, peran, dan link Google Drive bukti (input teks URL, boleh lebih dari satu link — misal sertifikat dan dokumentasi terpisah). Validasi format URL harus mengandung domain drive.google.com, dan beri instruksi jelas di form bahwa file harus di-share dengan akses "siapa saja yang punya link dapat melihat" agar bisa diperiksa verifikator.
Step 4 — Konfirmasi & Submit: ringkasan data sebelum submit final.
Setelah submit: generate kode_tiket unik (format PRS-YYYY-XXXXX), simpan ke database, kirim email konfirmasi berisi kode tiket, redirect ke halaman sukses yang menampilkan kode tiket.
/status — Cek status pengajuan Form input kode tiket + NIM/NIP → tampilkan status pengajuan (Menunggu/Direvisi/Diterima/Ditolak) beserta catatan verifikator jika ada. Jika status "Direvisi", tampilkan tombol untuk membuka form edit (memerlukan verifikasi OTP ulang sebelum bisa mengedit).

/revisi/[token] — Halaman revisi via tautan email Tautan unik berbatas waktu (7 hari) yang dikirim saat status "Direvisi". Meminta OTP ulang, lalu membuka kembali form pengajuan dalam mode edit dengan data sebelumnya ter-prefill.

4.2 Dashboard Internal (dengan login — verifikator/admin)
/login — Login untuk verifikator/admin menggunakan Supabase Auth (email + password via supabase.auth.signInWithPassword). Setelah login, ambil baris profil_internal terkait untuk menentukan role & scope prodi, lalu gunakan itu untuk mengatur akses halaman/dashboard (middleware Next.js untuk proteksi rute /dashboard/*).

/dashboard — Ringkasan: jumlah pengajuan per status, grafik sederhana per bulan, per kategori.

/dashboard/pengajuan — Tabel semua pengajuan dengan filter (status, kategori, prodi, rentang tanggal) dan pencarian by NIM/NIP/nama.

/dashboard/pengajuan/[id] — Detail satu pengajuan: semua data, daftar link Google Drive bukti (ditampilkan sebagai tautan yang bisa dibuka verifikator di tab baru untuk diperiksa manual — tidak ada preview inline karena bukan file yang di-hosting sendiri), riwayat log verifikasi, dan aksi: Terima / Tolak / Minta Revisi (dengan input catatan wajib untuk tolak/revisi). Aksi ini mengirim email notifikasi otomatis ke pelapor dan mencatat ke log_verifikasi.

/dashboard/kategori (khusus admin) — CRUD kategori prestasi & bobot poinnya.

/dashboard/master-data (khusus admin) — CRUD/impor data master mahasiswa & dosen (dukung impor massal via CSV, dengan pemetaan ke prodi_id yang sudah ada). Sertakan juga sub-halaman CRUD Fakultas dan CRUD Prodi (prodi wajib dikaitkan ke satu fakultas) sebagai data referensi sebelum data master mahasiswa/dosen bisa diimpor.

/dashboard/laporan — Rekap per individu/prodi/fakultas, dengan tombol ekspor ke Excel (gunakan library seperti exceljs) dan PDF.

/dashboard/pengguna (khusus admin) — Kelola akun verifikator/admin: buat user baru lewat Supabase Auth Admin API (supabase.auth.admin.createUser, dipanggil dari server dengan service role key), lalu buat baris profil_internal terkait dengan role dan prodi_scope_id-nya (dipilih dari dropdown tabel prodi, khusus untuk role VERIFIKATOR).

5. Kebutuhan Non-Fungsional Penting
Rate limiting: batasi permintaan ke endpoint lookup NIM/NIP dan pengiriman OTP (mis. maks 5 percobaan per 15 menit per IP/NIM) untuk mencegah brute-force dan enumerasi data pribadi.
Validasi link bukti: pastikan input berupa URL valid dan mengandung drive.google.com; tampilkan peringatan di form agar pelapor mengatur sharing filenya sebagai "siapa saja yang punya link" — jika tidak, verifikator tidak bisa membukanya dan pengajuan berisiko ditolak/diminta revisi.
OTP: 6 digit numerik, kedaluwarsa 10 menit, sekali pakai, hashing sebelum disimpan ke database (jangan simpan plaintext).
Tautan revisi: token acak yang aman (misal UUID v4 atau signed token), kedaluwarsa otomatis setelah 7 hari, hanya bisa dipakai sekali per pengajuan aktif.
Role-based access control: verifikator prodi hanya boleh melihat/mengelola pengajuan dari prodinya; admin memiliki akses penuh.
Audit trail: setiap perubahan status pengajuan tercatat di LogVerifikasi (siapa, kapan, aksi apa, catatan apa).
Responsif: seluruh halaman publik (form pengajuan, cek status) harus nyaman diakses dari HP.
Aksesibilitas dasar: label form yang jelas, kontras warna cukup, pesan error yang deskriptif.
6. Prioritas Pengembangan (untuk vibe coding bertahap)
Kerjakan secara bertahap dengan urutan berikut, dan pastikan tiap tahap bisa dijalankan/diuji sebelum lanjut ke tahap berikutnya:

Setup project (Next.js + Tailwind + koneksi Supabase project), jalankan migrasi SQL tabel di atas (termasuk fakultas dan prodi sebagai data referensi paling dasar), aktifkan RLS, dan jalankan seed data awal.
Buat 1 akun admin lewat Supabase Auth + baris profil_internal role ADMIN, pastikan bisa login di /login.
Buat alur pengajuan publik (/ajukan) sampai berhasil submit dan tersimpan ke database lewat API Route dengan service role key, termasuk lookup NIM/NIP dan OTP (boleh dummy/log ke console dulu untuk pengiriman email sebelum integrasi email asli).
Buat halaman cek status (/status).
Buat dashboard dasar untuk verifikator/admin (/dashboard, /dashboard/pengajuan, detail & aksi verifikasi), dengan proteksi rute via middleware Supabase Auth.
Integrasikan pengiriman email sungguhan (OTP & notifikasi status) menggunakan Resend.
Tambahkan halaman revisi (/revisi/[token]).
Tambahkan manajemen kategori, master data, kelola pengguna internal, dan laporan/ekspor.
Terakhir: uji policy RLS secara menyeluruh (pastikan verifikator prodi A tidak bisa melihat data prodi B), tambahkan rate limiting, dan uji ulang seluruh alur end-to-end.
7. Catatan Tambahan untuk AI Coding Assistant
Gunakan komponen UI yang konsisten (bisa pakai shadcn/ui di atas Tailwind untuk mempercepat).
Tuliskan komentar singkat di bagian-bagian penting logika (lookup NIM/NIP, validasi OTP, generate kode tiket) agar mudah ditelusuri.
Buat file .env.example yang mencantumkan semua environment variable yang dibutuhkan: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (server-only, jangan pernah diekspos ke client), serta API key Resend/SMTP.
Tegaskan di kode: service role key hanya dipakai di server (API Route/Edge Function), tidak pernah di komponen client, karena key ini melewati semua RLS.
Sertakan instruksi singkat di README.md tentang cara menjalankan migrasi SQL di Supabase (lewat Supabase CLI supabase db push atau SQL editor) dan menjalankan seed data.