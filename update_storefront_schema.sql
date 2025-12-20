-- 1. Add History to Establishments
alter table public.establishments add column if not exists history text;

-- 2. Ensure Professionals table exists and has linkage
create table if not exists public.professionals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  role text,
  image text,
  commission numeric,
  establishment_id uuid references public.establishments
);

-- Add column if table existed but column didn't
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'professionals' and column_name = 'establishment_id') then
    alter table public.professionals add column establishment_id uuid references public.establishments;
  end if;
end $$;

-- 3. Ensure Products table exists and has linkage
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price numeric,
  image text,
  establishment_id uuid references public.establishments
);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'establishment_id') then
    alter table public.products add column establishment_id uuid references public.establishments;
  end if;
end $$;

-- 4. Enable RLS (Safety Net)
alter table public.professionals enable row level security;
alter table public.products enable row level security;

create policy "Public read access professionals" on public.professionals for select using (true);
create policy "Public read access products" on public.products for select using (true);

create policy "Owner manage professionals" on public.professionals for all using (true); -- Simplificando por enquanto
create policy "Owner manage products" on public.products for all using (true);

-- 5. BACKFILL: Link Orphan Data to Salão Denys (Crucial for user request)
do $$
declare
  v_denys_id uuid;
begin
  select id into v_denys_id from public.establishments where slug = 'salao-denys' limit 1;
  
  if v_denys_id is not null then
    update public.professionals set establishment_id = v_denys_id where establishment_id is null;
    update public.products set establishment_id = v_denys_id where establishment_id is null;
  end if;
end $$;
