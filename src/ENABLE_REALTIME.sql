-- Supabase SQL Patch: Enable Postgres Realtime for orders and pricing_rules tables
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/hgxhdmcqrcsjsxuaeyrl/sql/new)

-- Check if publication exists and add the tables to the supabase_realtime publication
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    -- Add tables to the publication (using alter publication add table)
    -- If already added, postgres will ignore or we can catch any exceptions
    begin
      alter publication supabase_realtime add table public.orders;
    exception when duplicate_object then
      raise notice 'Table orders already exists in publication';
    end;
    
    begin
      alter publication supabase_realtime add table public.pricing_rules;
    exception when duplicate_object then
      raise notice 'Table pricing_rules already exists in publication';
    end;
  else
    -- Create publication if it doesn't exist (unlikely in Supabase, but good practice)
    create publication supabase_realtime for table public.orders, public.pricing_rules;
  end if;
end;
$$;
