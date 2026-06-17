-- ============================================
-- MIGRATION: Tambah kolom is_active ke profiles
-- ============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean not null default true;
