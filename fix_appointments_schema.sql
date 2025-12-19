-- Forçar a adição das colunas que podem estar faltando
alter table appointments 
add column if not exists client_name text,
add column if not exists service_id uuid references services(id),
add column if not exists service_name text,
add column if not exists professional_id uuid references professionals(id),
add column if not exists date date,
add column if not exists time time,
add column if not exists price numeric(10,2),
add column if not exists status text default 'pending';

-- Garantir que as colunas não sejam nulas onde não devem (opcional, mas bom para integridade)
-- alter table appointments alter column client_name set not null;
-- alter table appointments alter column date set not null;
-- alter table appointments alter column time set not null;

-- Recarregar o cache do schema (útil para o Supabase reconhecer a mudança na hora)
NOTIFY pgrst, 'reload schema';
