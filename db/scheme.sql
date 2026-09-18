-- Sistem Prestasi: skema Supabase, RLS, dan seed data development.
create extension if not exists pgcrypto;

create table if not exists fakultas (id uuid primary key default gen_random_uuid(), nama text unique not null, kode text unique);
create table if not exists prodi (id uuid primary key default gen_random_uuid(), nama text not null, kode text unique, fakultas_id uuid references fakultas(id) not null, unique (nama, fakultas_id));
create table if not exists master_akademik (id uuid primary key default gen_random_uuid(), nim_nip text unique not null, nama text not null, jenis text not null check (jenis in ('MAHASISWA','DOSEN')), prodi_id uuid references prodi(id) not null, email_kampus text not null, status_aktif boolean default true, created_at timestamptz default now());
create table if not exists kategori_prestasi (id uuid primary key default gen_random_uuid(), nama text not null, tingkat_default text, bobot_poin integer default 0, aktif boolean default true);
create table if not exists pengajuan (id uuid primary key default gen_random_uuid(), kode_tiket text unique not null, master_akademik_id uuid references master_akademik(id) not null, kategori_id uuid references kategori_prestasi(id) not null, judul text not null, deskripsi text, tingkat text not null check (tingkat in ('LOKAL','NASIONAL','INTERNASIONAL')), tanggal_kegiatan date not null, penyelenggara text, peran text check (peran in ('INDIVIDU','TIM')), status text not null default 'MENUNGGU' check (status in ('MENUNGGU','DIREVISI','DITERIMA','DITOLAK')), catatan_verifikator text, verifikator_id uuid references auth.users(id), created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists bukti_lampiran (id uuid primary key default gen_random_uuid(), pengajuan_id uuid references pengajuan(id) on delete cascade, nama_bukti text not null, link_drive text not null check (link_drive like 'https://drive.google.com/%'), created_at timestamptz default now());
create table if not exists otp_verifikasi (id uuid primary key default gen_random_uuid(), master_akademik_id uuid references master_akademik(id) not null, kode_otp_hash text not null, kedaluwarsa_at timestamptz not null, terpakai boolean default false, created_at timestamptz default now());
create table if not exists log_verifikasi (id uuid primary key default gen_random_uuid(), pengajuan_id uuid references pengajuan(id) not null, verifikator_id uuid references auth.users(id) not null, aksi text not null, catatan text, created_at timestamptz default now());
create table if not exists profil_internal (id uuid primary key references auth.users(id) on delete cascade, nama text not null, role text not null check (role in ('VERIFIKATOR','ADMIN')), prodi_scope_id uuid references prodi(id));

alter table fakultas enable row level security; alter table prodi enable row level security; alter table master_akademik enable row level security; alter table kategori_prestasi enable row level security; alter table pengajuan enable row level security; alter table bukti_lampiran enable row level security; alter table otp_verifikasi enable row level security; alter table log_verifikasi enable row level security; alter table profil_internal enable row level security;
create policy "public read reference" on fakultas for select using (true);
create policy "public read prodi" on prodi for select using (true);
create policy "public read category" on kategori_prestasi for select using (aktif = true);
create policy "own profile" on profil_internal for select using (id = auth.uid());
create policy "admins manage references" on fakultas for all using (exists(select 1 from profil_internal where id = auth.uid() and role = 'ADMIN'));
create policy "admins manage prodi" on prodi for all using (exists(select 1 from profil_internal where id = auth.uid() and role = 'ADMIN'));
create policy "admins manage categories" on kategori_prestasi for all using (exists(select 1 from profil_internal where id = auth.uid() and role = 'ADMIN'));
-- Data sensitif (master, pengajuan, OTP, lampiran) hanya diakses lewat server service-role API.

insert into fakultas (nama,kode) values ('Fakultas Sains dan Teknologi','FST'),('Fakultas Ekonomi dan Bisnis Islam','FEBI'),('Fakultas Tarbiyah','FT'),('Fakultas Syariah','FASYA'),('Fakultas Ushuluddin dan Dakwah','FUD'),('Fakultas Adab dan Bahasa','FAB') on conflict do nothing;
insert into prodi (nama,kode,fakultas_id) select v.nama,v.kode,f.id from (values
  ('Informatika','INF','Fakultas Sains dan Teknologi'),
  ('Sains Data','SDT','Fakultas Sains dan Teknologi'),
  ('Teknologi Pangan','TPG','Fakultas Sains dan Teknologi'),
  ('Bioteknologi','BTK','Fakultas Sains dan Teknologi'),
  ('Ilmu Lingkungan','IL','Fakultas Sains dan Teknologi')
) v(nama,kode,fakultas) join fakultas f on f.nama=v.fakultas on conflict do nothing;
insert into kategori_prestasi (nama,tingkat_default,bobot_poin) values ('Juara Lomba','NASIONAL',100),('Publikasi Jurnal','NASIONAL',90),('Sertifikasi Kompetensi','NASIONAL',70),('Penghargaan','LOKAL',50) on conflict do nothing;
insert into master_akademik (nim_nip,nama,jenis,prodi_id,email_kampus)
select v.kode,v.nama,v.jenis,p.id,v.kode || '@kampus.ac.id'
from (values
  ('202101001','Nadia Putri','MAHASISWA','Informatika'),('202101002','Rizky Ramadhan','MAHASISWA','Sains Data'),
  ('202101003','Salsa Maharani','MAHASISWA','Teknologi Pangan'),('202101004','Fajar Hidayat','MAHASISWA','Bioteknologi'),
  ('202101005','Ayu Lestari','MAHASISWA','Ilmu Lingkungan'),('202101006','Bima Pratama','MAHASISWA','Informatika'),
  ('202101007','Citra Wulandari','MAHASISWA','Sains Data'),('202101008','Dimas Saputra','MAHASISWA','Teknologi Pangan'),
  ('202101009','Intan Permata','MAHASISWA','Bioteknologi'),('202101010','Yoga Kurniawan','MAHASISWA','Ilmu Lingkungan'),
  ('NIP19850101','Dr. Ahmad Fauzi','DOSEN','Informatika'),('NIP19860202','Dr. Maya Sari','DOSEN','Sains Data'),
  ('NIP19870303','Dr. Budi Santoso','DOSEN','Teknologi Pangan'),('NIP19880404','Dr. Laila Hasanah','DOSEN','Bioteknologi'),
  ('NIP19890505','Dr. Rendra Wijaya','DOSEN','Ilmu Lingkungan')
) v(kode,nama,jenis,prodi) join prodi p on p.nama = v.prodi on conflict (nim_nip) do nothing;
-- Akun admin dibuat aman melalui Supabase Dashboard/Auth Admin API, lalu:
-- insert into profil_internal (id,nama,role) values ('<AUTH_USER_UUID>','Admin Sistem','ADMIN');
