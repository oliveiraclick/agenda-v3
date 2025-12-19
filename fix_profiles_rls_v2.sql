-- 1. Remover políticas antigas para evitar conflitos (DROP)
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Public profiles" on profiles;
drop policy if exists "Enable read access for all users" on profiles;

-- 2. Garantir que RLS está ativo
alter table profiles enable row level security;

-- 3. Recriar Políticas Corretas

-- LEITURA: Pública (Todo mundo pode ver nome/foto do salão)
create policy "Public profiles"
on profiles for select
using ( true );

-- UPDATE: Apenas o dono do perfil pode editar
create policy "Users can update own profile"
on profiles for update
using ( auth.uid() = id );

-- INSERT: Apenas o dono pode criar seu perfil (no cadastro)
create policy "Users can insert own profile"
on profiles for insert
with check ( auth.uid() = id );
