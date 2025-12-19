-- Habilitar a extensão de storage se ainda não estiver (geralmente já vem habilitada)
-- create extension if not exists "storage";

-- 1. Criar Bucket 'avatars' (se não existir)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Criar Bucket 'products' (se não existir)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 3. Políticas de Segurança (RLS) para 'avatars'

-- Permitir leitura pública (qualquer um pode ver as fotos)
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Permitir upload apenas para usuários autenticados
create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Permitir atualização (substituir foto) para usuários autenticados
create policy "Anyone can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- 4. Políticas de Segurança (RLS) para 'products'

-- Permitir leitura pública
create policy "Product images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- Permitir upload para usuários autenticados (Donos)
create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );
