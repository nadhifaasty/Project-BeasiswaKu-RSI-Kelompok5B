-- ============================================
-- Migration: Application Status History
-- Menycatat setiap perubahan status pengajuan
-- untuk timeline visual 6 tahap (FR-09)
-- ============================================

create table if not exists public.application_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade not null,
  old_status text,
  new_status text not null,
  catatan_admin text,
  changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.application_history enable row level security;

-- Trigger untuk otomatis mencatat perubahan status
create or replace function public.log_application_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into public.application_history (application_id, old_status, new_status, catatan_admin, changed_by)
    values (new.id, old.status, new.status, new.catatan_admin, null);
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_audit_applications on public.applications;
create trigger trg_audit_applications
  after update of status on public.applications
  for each row
  execute function public.log_application_status_change();
