-- Habilitar RLS na tabela profiles (se não estiver)
alter table profiles enable row level security;

-- Remover políticas antigas para evitar conflitos (opcional, mas recomendado se houver bagunça)
-- drop policy if exists "Users can update own profile" on profiles;

-- 1. Permitir UPDATE no próprio perfil
create policy "Users can update own profile"
on profiles for update
using ( auth.uid() = id );

-- 2. Permitir INSERT (caso não tenha)
create policy "Users can insert own profile"
on profiles for insert
with check ( auth.uid() = id );

-- 3. Permitir SELECT (Leitura pública ou privada? Geralmente pública para 'role' ser visível, ou restrita)
-- Vamos garantir que o dono possa ver seu próprio perfil
create policy "Users can view own profile"
on profiles for select
using ( auth.uid() = id );
