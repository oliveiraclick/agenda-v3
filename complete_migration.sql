-- COMPLETE MIGRATION SCRIPT (SAFE TO RUN MULTIPLE TIMES)

-- 1. ESTABLISHMENTS
create table if not exists public.establishments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  type text,
  category text,
  rating numeric default 5.0,
  image_url text
);

alter table public.establishments enable row level security;

do $$
begin
  if not exists (select from pg_policies where policyname = 'Allow public read access' and tablename = 'establishments') then
    create policy "Allow public read access" on public.establishments for select using (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from public.establishments) then
    insert into public.establishments (name, type, category, rating, image_url) values
    ('Studio Beauty Elite', 'Cabelo • Hidratação', 'salao', 4.9, 'https://picsum.photos/seed/shop1/400/200'),
    ('Don Barbearia', 'Corte • Barba', 'salao', 4.8, 'https://picsum.photos/seed/barber/400/200'),
    ('Pet Shop Amigo Fiel', 'Banho • Tosa', 'pet', 5.0, 'https://picsum.photos/seed/pet1/400/200'),
    ('Lava Rápido Jet', 'Lavagem • Polimento', 'li', 4.7, 'https://picsum.photos/seed/car/400/200'),
    ('Cantinho do Pet', 'Veterinário • Banho', 'pet', 4.9, 'https://picsum.photos/seed/pet2/400/200');
  end if;
end $$;

-- 2. FAVORITES
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  establishment_id uuid references public.establishments not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, establishment_id)
);

alter table public.favorites enable row level security;

do $$
begin
  if not exists (select from pg_policies where policyname = 'Users can view own favorites' and tablename = 'favorites') then
    create policy "Users can view own favorites" on public.favorites for select using (auth.uid() = user_id);
  end if;
  if not exists (select from pg_policies where policyname = 'Users can insert own favorites' and tablename = 'favorites') then
    create policy "Users can insert own favorites" on public.favorites for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select from pg_policies where policyname = 'Users can delete own favorites' and tablename = 'favorites') then
    create policy "Users can delete own favorites" on public.favorites for delete using (auth.uid() = user_id);
  end if;
end $$;

-- 3. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  name text,
  role text default 'customer',
  avatar_url text,
  phone text
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (select from pg_policies where policyname = 'Public profiles are viewable by everyone' and tablename = 'profiles') then
    create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
  end if;
  if not exists (select from pg_policies where policyname = 'Users can insert their own profile' and tablename = 'profiles') then
    create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select from pg_policies where policyname = 'Users can update own profile' and tablename = 'profiles') then
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

-- 4. SERVICES
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  duration text not null,
  price numeric not null,
  category text
);

alter table public.services enable row level security;

do $$
begin
  if not exists (select from pg_policies where policyname = 'Allow public read access on services' and tablename = 'services') then
    create policy "Allow public read access on services" on public.services for select using (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from public.services) then
    insert into public.services (name, description, duration, price, category) values
    ('Corte Degradê', 'Corte na tesoura e máquina, acabamento na navalha.', '45 min', 50, 'Cabelo'),
    ('Barba Terapia', 'Toalha quente, massagem facial e hidratação.', '30 min', 35, 'Barba'),
    ('Combo Elite', 'Cabelo, barba e sobrancelha com desconto.', '90 min', 95, 'Combos');
  end if;
end $$;

-- 5. PROFESSIONALS
create table if not exists public.professionals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  role text,
  image text,
  performance numeric default 0,
  revenue text,
  commission_service numeric default 0,
  commission_product numeric default 0,
  status text default 'active'
);

alter table public.professionals enable row level security;

do $$
begin
  if not exists (select from pg_policies where policyname = 'Allow public read access on professionals' and tablename = 'professionals') then
    create policy "Allow public read access on professionals" on public.professionals for select using (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from public.professionals) then
    insert into public.professionals (name, role, image, performance, revenue, commission_service, commission_product, status) values
    ('João', 'Barbeiro Master', 'https://picsum.photos/seed/p1/200', 85, '1.8k', 40, 10, 'active'),
    ('Marcos', 'Especialista em Fade', 'https://picsum.photos/seed/p2/200', 65, '1.2k', 35, 10, 'active'),
    ('Ana', 'Visagista', 'https://picsum.photos/seed/p3/200', 50, '950', 45, 15, 'active');
  end if;
end $$;

-- 6. PRODUCTS
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  brand text,
  price numeric not null,
  cost numeric default 0,
  image text,
  stock integer default 0,
  category text,
  status text default 'normal'
);

alter table public.products enable row level security;

do $$
begin
  if not exists (select from pg_policies where policyname = 'Allow public read access on products' and tablename = 'products') then
    create policy "Allow public read access on products" on public.products for select using (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from public.products) then
    insert into public.products (name, brand, price, cost, image, stock, category, status) values
    ('Pomada Matte', 'Alta Fixação', 45, 22, 'https://picsum.photos/seed/pr1/200', 15, 'Finalizadores', 'normal'),
    ('Óleo de Barba', 'Essência Wood', 30, 14, 'https://picsum.photos/seed/pr2/200', 8, 'Barba', 'normal'),
    ('Shampoo Fresh', 'Vintage Club', 28, 12, 'https://picsum.photos/seed/pr3/200', 3, 'Higiene', 'low');
  end if;
end $$;

-- 7. APPOINTMENTS
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users,
  client_name text,
  service_id uuid references public.services,
  professional_id uuid references public.professionals,
  date date not null,
  time time not null,
  duration text,
  price numeric,
  status text default 'pending',
  notes text
);

alter table public.appointments enable row level security;

do $$
begin
  if not exists (select from pg_policies where policyname = 'Users can view own appointments' and tablename = 'appointments') then
    create policy "Users can view own appointments" on public.appointments for select using (auth.uid() = user_id);
  end if;
  if not exists (select from pg_policies where policyname = 'Users can create appointments' and tablename = 'appointments') then
    create policy "Users can create appointments" on public.appointments for insert with check (auth.uid() = user_id);
  end if;
end $$;
