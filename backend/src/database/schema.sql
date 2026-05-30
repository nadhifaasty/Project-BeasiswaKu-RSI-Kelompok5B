-- ============================================
-- BeasiswaKu - Database Schema
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nama_lengkap text not null,
  nim_nisn text unique not null,
  nomor_hp text not null,
  email text not null,
  role text not null default 'siswa' check (role in ('siswa', 'admin', 'super_admin')),
  biodata_progress integer not null default 0 check (biodata_progress between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- 2. BIODATA PRIBADI
create table if not exists public.biodata_pribadi (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  nama_lengkap text not null,
  nim_nisn text not null,
  email text not null,
  nomor_hp text not null,
  tempat_lahir text,
  tanggal_lahir date,
  jenis_kelamin text check (jenis_kelamin in ('Laki-laki', 'Perempuan')),
  agama text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.biodata_pribadi enable row level security;

-- 3. BIODATA ALAMAT
create table if not exists public.biodata_alamat (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  alamat text not null,
  rt_rw text,
  kelurahan text,
  provinsi text not null,
  kota text not null,
  kecamatan text not null,
  kode_pos text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.biodata_alamat enable row level security;

-- 4. BIODATA ORANG TUA
create table if not exists public.biodata_orang_tua (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  ayah_nama text not null,
  ayah_pekerjaan text not null,
  ayah_penghasilan numeric not null,
  ibu_nama text not null,
  ibu_pekerjaan text not null,
  ibu_penghasilan numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.biodata_orang_tua enable row level security;

-- 5. BIODATA AKADEMIK
create table if not exists public.biodata_akademik (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  jenjang text not null,
  asal_institusi text not null,
  program_studi text not null,
  ipk_nilai numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.biodata_akademik enable row level security;

-- 6. SCHOLARSHIP PROGRAMS
create table if not exists public.scholarship_programs (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  deskripsi text not null,
  nominal text not null,
  deadline date not null,
  kuota integer not null,
  sisa_kuota integer not null,
  status text not null default 'aktif' check (status in ('aktif', 'ditutup')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.scholarship_programs enable row level security;

-- 7. APPLICATIONS (pengajuan beasiswa)
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  program_id uuid references public.scholarship_programs(id) on delete cascade not null,
  nomor_referensi text unique not null,
  ipk numeric not null,
  esai_motivasi text not null,
  prestasi_non_akademik text,
  status text not null default 'PENDING' check (status in ('PENDING', 'TERVERIFIKASI', 'REVISI', 'DITOLAK', 'DITERIMA', 'CADANGAN')),
  skor_kelayakan numeric,
  catatan_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, program_id)
);
alter table public.applications enable row level security;

-- 8. APPLICATION DOCUMENTS
create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade not null,
  jenis text not null check (jenis in ('foto', 'ktp', 'kartu_keluarga', 'transkrip', 'sktm', 'sertifikat_prestasi')),
  file_url text not null,
  status text not null default 'menunggu' check (status in ('menunggu', 'tervalidasi', 'ditolak')),
  created_at timestamptz not null default now()
);
alter table public.application_documents enable row level security;

-- 9. FUND DISBURSEMENTS (pencairan dana)
create table if not exists public.fund_disbursements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  application_id uuid references public.applications(id) on delete cascade not null,
  nama_bank text not null,
  nomor_rekening text not null,
  nama_pemegang text not null,
  cabang_bank text not null,
  foto_buku_tabungan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.fund_disbursements enable row level security;

-- 10. FUND REPORTS (laporan penggunaan dana)
create table if not exists public.fund_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  application_id uuid references public.applications(id) on delete cascade not null,
  bulan text not null,
  kategori text not null,
  jumlah numeric not null,
  keterangan text not null,
  bukti_url text,
  status text not null default 'draft' check (status in ('draft', 'dikirim', 'terverifikasi', 'ditolak')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.fund_reports enable row level security;

-- 11. SELECTION RESULTS (hasil seleksi)
create table if not exists public.selection_results (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade not null unique,
  skor_akademik numeric not null,
  skor_ekonomi numeric not null,
  skor_prestasi numeric not null,
  skor_dokumen numeric not null,
  skor_total numeric not null,
  hasil text not null check (hasil in ('DITERIMA', 'CADANGAN', 'DITOLAK')),
  disahkan_oleh uuid references public.profiles(id),
  disahkan_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.selection_results enable row level security;

-- 12. AUDIT LOGS
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  aksi text not null,
  level text not null default 'INFO' check (level in ('INFO', 'WARNING', 'ERROR')),
  ip_address text,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Profiles: user hanya bisa lihat/edit profil sendiri, admin bisa lihat semua
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Biodata: user hanya bisa akses data sendiri
create policy "Users can manage own biodata"
  on public.biodata_pribadi for all using (auth.uid() = user_id);
create policy "Users can manage own alamat"
  on public.biodata_alamat for all using (auth.uid() = user_id);
create policy "Users can manage own ortu"
  on public.biodata_orang_tua for all using (auth.uid() = user_id);
create policy "Users can manage own akademik"
  on public.biodata_akademik for all using (auth.uid() = user_id);

-- Applications: user lihat punya sendiri, admin lihat semua
create policy "Users can view own applications"
  on public.applications for select using (auth.uid() = user_id);
create policy "Users can insert own applications"
  on public.applications for insert with check (auth.uid() = user_id);

-- ============================================
-- SEED DATA (program beasiswa)
-- ============================================
insert into public.scholarship_programs (nama, deskripsi, nominal, deadline, kuota, sisa_kuota) values
  ('Beasiswa SMA', 'Diperuntukkan bagi siswa aktif SMA/SMK/MA sederajat. Berbasis kelayakan akademik dan kondisi ekonomi keluarga.', 'Rp 750.000 / bulan', '2026-01-25', 50, 50),
  ('Beasiswa Perguruan Tinggi', 'Diperuntukkan bagi mahasiswa aktif S1/D3/D4 di PTN maupun PTS. Berbasis IPK dan kondisi ekonomi.', 'Rp 1.000.000 / bulan', '2026-01-25', 100, 100)
on conflict do nothing;

-- ============================================
-- MIGRATION: Tambahan kolom biodata (untuk DB yang sudah ada)
-- Aman dijalankan berulang kali (idempotent).
-- ============================================
alter table public.biodata_pribadi add column if not exists tempat_lahir text;
alter table public.biodata_pribadi add column if not exists tanggal_lahir date;
alter table public.biodata_pribadi add column if not exists jenis_kelamin text;
alter table public.biodata_pribadi add column if not exists agama text;

alter table public.biodata_alamat add column if not exists rt_rw text;
alter table public.biodata_alamat add column if not exists kelurahan text;
