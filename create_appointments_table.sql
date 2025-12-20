-- Drop table if exists to ensure schema update
drop table if exists public.appointments;

-- Create Appointments table
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  establishment_id uuid references public.establishments not null,
  service_name text not null,
  professional_name text,
  date date not null,
  time text not null,
  price numeric not null,
  status text default 'scheduled' -- 'scheduled', 'completed', 'cancelled'
);

-- Enable RLS
alter table public.appointments enable row level security;

-- Policies
create policy "Users can view own appointments" 
on public.appointments for select 
using (auth.uid() = user_id);

create policy "Users can insert own appointments" 
on public.appointments for insert 
with check (auth.uid() = user_id);

create policy "Users can update own appointments" 
on public.appointments for update 
using (auth.uid() = user_id);
