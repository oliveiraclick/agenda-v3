-- Enable RLS
alter table appointments enable row level security;

-- Drop NEW policies if they exist (to fix 42710 error)
drop policy if exists "Users can view relevant appointments" on appointments;
drop policy if exists "Users can insert appointments" on appointments;
drop policy if exists "Users can update appointments" on appointments;

-- Drop existing/old policies to avoid conflicts
drop policy if exists "Users can view their own appointments" on appointments;
drop policy if exists "Users can insert their own appointments" on appointments;
drop policy if exists "Users can update their own appointments" on appointments;
drop policy if exists "Owners can view all appointments" on appointments;
drop policy if exists "Authenticated users can select appointments" on appointments;
drop policy if exists "Authenticated users can insert appointments" on appointments;
drop policy if exists "Authenticated users can update appointments" on appointments;

-- 1. Permite visualizar: Donos veem do seu estabelecimento, Clientes veem os seus proprios
create policy "Users can view relevant appointments"
on appointments for select
using (
  auth.uid() = user_id OR 
  exists (
    select 1 from establishments 
    where establishments.id = appointments.establishment_id 
    and establishments.owner_id = auth.uid()
  )
);

-- 2. Permite agendar: Qualquer usuario autenticado pode criar um agendamento (Cliente)
create policy "Users can insert appointments"
on appointments for insert
with check (
  auth.role() = 'authenticated'
);

-- 3. Permite atualizar: Donos podem atualizar (confirmar/cancelar), Clientes podem cancelar os seus
create policy "Users can update appointments"
on appointments for update
using (
  auth.uid() = user_id OR 
  exists (
    select 1 from establishments 
    where establishments.id = appointments.establishment_id 
    and establishments.owner_id = auth.uid()
  )
);

-- Check if columns exist, if not add them (just in case)
alter table appointments 
add column if not exists client_name text,
add column if not exists service_name text,
add column if not exists status text default 'scheduled';
