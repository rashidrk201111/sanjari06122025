-- Admin audit log table for dashboard action tracking
-- Run this in Supabase SQL editor before using the Audit Logs tab.

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  admin_email text not null,
  admin_name text not null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_logs_created_at
  on public.admin_audit_logs (created_at desc);

create index if not exists idx_admin_audit_logs_admin_id
  on public.admin_audit_logs (admin_id);

alter table public.admin_audit_logs enable row level security;

-- Allow admin/staff users to read audit logs.
drop policy if exists "admin_staff_can_read_admin_audit_logs" on public.admin_audit_logs;
create policy "admin_staff_can_read_admin_audit_logs"
on public.admin_audit_logs
for select
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role in ('admin', 'staff')
  )
);

-- Allow admin/staff users to insert audit logs.
drop policy if exists "admin_staff_can_insert_admin_audit_logs" on public.admin_audit_logs;
create policy "admin_staff_can_insert_admin_audit_logs"
on public.admin_audit_logs
for insert
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role in ('admin', 'staff')
  )
);
