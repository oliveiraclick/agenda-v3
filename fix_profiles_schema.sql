-- Adicionar colunas que podem estar faltando na tabela profiles
alter table profiles 
add column if not exists avatar_url text,
add column if not exists phone text,
add column if not exists address text,
add column if not exists description text;

-- Garantir que o RLS está ativo (só por segurança)
alter table profiles enable row level security;
