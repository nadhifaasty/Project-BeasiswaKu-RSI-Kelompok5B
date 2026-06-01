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
  profile_data jsonb not null default '{}',
  biodata_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- 2. SCHOLARSHIP PROGRAMS
create table if not exists public.scholarship_programs (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  deskripsi text not null,
  monthly_amount numeric(12,2) not null,
  deadline date not null,
  kuota integer not null,
  sisa_kuota integer not null,
  status text not null default 'aktif' check (status in ('aktif', 'ditutup')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.scholarship_programs enable row level security;

-- 3. APPLICATIONS (pengajuan beasiswa)
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

-- 4. APPLICATION DOCUMENTS
create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade not null,
  jenis text not null check (jenis in ('foto', 'ktp', 'kartu_keluarga', 'transkrip', 'sktm', 'sertifikat_prestasi')),
  file_url text not null,
  status text not null default 'menunggu' check (status in ('menunggu', 'tervalidasi', 'ditolak')),
  created_at timestamptz not null default now()
);
alter table public.application_documents enable row level security;

-- 5. FUND DISBURSEMENTS (pencairan dana)
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

-- 6. FUND REPORTS (laporan penggunaan dana)
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

-- 7. SELECTION RESULTS (hasil seleksi)
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

-- 8. AUDIT LOGS
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

-- Profile data stored in jsonb `profile_data` column on profiles table

-- Applications: user lihat punya sendiri, admin lihat semua
create policy "Users can view own applications"
  on public.applications for select using (auth.uid() = user_id);
create policy "Users can insert own applications"
  on public.applications for insert with check (auth.uid() = user_id);

-- ============================================
-- SEED DATA (program beasiswa)
-- ============================================
insert into public.scholarship_programs (nama, deskripsi, monthly_amount, deadline, kuota, sisa_kuota) values
  ('Beasiswa SMA', 'Diperuntukkan bagi siswa aktif SMA/SMK/MA sederajat. Berbasis kelayakan akademik dan kondisi ekonomi keluarga.', 750000.00, '2026-01-25', 50, 50),
  ('Beasiswa Perguruan Tinggi', 'Diperuntukkan bagi mahasiswa aktif S1/D3/D4 di PTN maupun PTS. Berbasis IPK dan kondisi ekonomi.', 1000000.00, '2026-01-25', 100, 100)
on conflict do nothing;
