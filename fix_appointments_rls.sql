-- Enable RLS
alter table appointments enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own appointments" on appointments;
drop policy if exists "Users can insert their own appointments" on appointments;
drop policy if exists "Users can update their own appointments" on appointments;
drop policy if exists "Owners can view all appointments" on appointments;
drop policy if exists "Owners can insert appointments" on appointments;

-- Create comprehensive policies for Owners (authenticated users)
-- Assuming for now that any authenticated user can manage appointments 
-- (Refine this later to restrict to specific salon if multi-tenant)

create policy "Authenticated users can select appointments"
on appointments for select
using ( auth.role() = 'authenticated' );

create policy "Authenticated users can insert appointments"
on appointments for insert
with check ( auth.role() = 'authenticated' );

create policy "Authenticated users can update appointments"
on appointments for update
using ( auth.role() = 'authenticated' );

-- Check if columns exist, if not add them (just in case)
alter table appointments 
add column if not exists client_name text,
add column if not exists service_name text,
add column if not exists status text default 'pending';
