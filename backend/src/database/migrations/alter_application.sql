-- ============================================
-- MIGRATION: Tambahan kolom data_akademik & status DRAFT
-- Aman dijalankan berulang kali (idempotent).
-- ============================================

-- Tambahkan kolom data_akademik
ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS data_akademik JSONB;

-- Perbarui constraint status agar mengizinkan DRAFT
ALTER TABLE public.applications 
  DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications 
  ADD CONSTRAINT applications_status_check 
  CHECK (status IN ('DRAFT', 'PENDING', 'TERVERIFIKASI', 'REVISI', 'DITOLAK', 'DITERIMA', 'CADANGAN'));
