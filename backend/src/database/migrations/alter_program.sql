-- ============================================
-- MIGRATION: FSD-7.2 Tambah Program Beasiswa
-- ============================================

-- 1. Tambah kolom target_level (SMA / PERGURUAN_TINGGI)
ALTER TABLE public.scholarship_programs 
ADD COLUMN IF NOT EXISTS target_level text check (target_level in ('SMA', 'PERGURUAN_TINGGI'));

-- 2. Tambah kolom created_by (Ref ke profiles)
ALTER TABLE public.scholarship_programs 
ADD COLUMN IF NOT EXISTS created_by uuid references public.profiles(id) on delete set null;

-- 3. Ubah check constraint kolom status agar mengizinkan DRAFT, OPEN, CLOSED (serta aktif, ditutup untuk backward compatibility)
ALTER TABLE public.scholarship_programs DROP CONSTRAINT IF EXISTS scholarship_programs_status_check;

ALTER TABLE public.scholarship_programs 
ADD CONSTRAINT scholarship_programs_status_check 
CHECK (status in ('aktif', 'ditutup', 'DRAFT', 'OPEN', 'CLOSED'));

-- Jika Anda ingin memberikan default DRAFT untuk data baru
ALTER TABLE public.scholarship_programs ALTER COLUMN status SET DEFAULT 'DRAFT';
