-- ============================================
-- MIGRATION: Tambah kolom verifikasi ke fund_disbursements
-- + Buat tabel system_settings
-- ============================================

-- 1. Tambah kolom verifikasi dan keamanan ke fund_disbursements
ALTER TABLE public.fund_disbursements
  ADD COLUMN IF NOT EXISTS is_verified boolean not null default false,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid references public.profiles(id) on delete set null,
  ADD COLUMN IF NOT EXISTS catatan text,
  ADD COLUMN IF NOT EXISTS ktp_file text;

-- 2. Buat tabel system_settings (konfigurasi global)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid primary key default gen_random_uuid(),
  min_ipk_sma numeric(4,2),
  min_ipk_pt numeric(4,2) not null default 2.75,
  max_penghasilan_ortu numeric not null default 3000000,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
ALTER TABLE public.system_settings enable row level security;

-- Insert default row jika belum ada
INSERT INTO public.system_settings (min_ipk_sma, min_ipk_pt, max_penghasilan_ortu)
SELECT NULL, 2.75, 3000000
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);
