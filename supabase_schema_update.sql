-- Create Services table
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  duration text not null, -- e.g., '45 min'
  price numeric not null,
  category text -- 'Cabelo', 'Barba', 'Combos'
);

-- Create Professionals table
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
  status text default 'active' -- 'active', 'vacation'
);

-- Create Products table
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
  status text default 'normal' -- 'normal', 'low', 'critical'
);

-- Create Appointments table
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users, -- Can be null if booked by admin for walk-in
  client_name text, -- For walk-ins or if user profile is missing name
  service_id uuid references public.services,
  professional_id uuid references public.professionals,
  date date not null,
  time time not null,
  duration text, -- Copy from service for historical accuracy
  price numeric, -- Copy from service for historical accuracy
  status text default 'pending', -- 'confirmed', 'pending', 'cancelled', 'completed'
  notes text
);

-- Enable RLS
alter table public.services enable row level security;
alter table public.professionals enable row level security;
alter table public.products enable row level security;
alter table public.appointments enable row level security;

-- Policies
-- Public read access for catalog tables
create policy "Allow public read access on services" on public.services for select using (true);
create policy "Allow public read access on professionals" on public.professionals for select using (true);
create policy "Allow public read access on products" on public.products for select using (true);

-- Appointments policies
create policy "Users can view own appointments" on public.appointments for select using (auth.uid() = user_id);
create policy "Users can create appointments" on public.appointments for insert with check (auth.uid() = user_id);
-- (In a real app, you'd want admin/professional policies too, but keeping it simple for now)

-- Insert Mock Data (Services)
insert into public.services (name, description, duration, price, category) values
('Corte Degradê', 'Corte na tesoura e máquina, acabamento na navalha.', '45 min', 50, 'Cabelo'),
('Barba Terapia', 'Toalha quente, massagem facial e hidratação.', '30 min', 35, 'Barba'),
('Combo Elite', 'Cabelo, barba e sobrancelha com desconto.', '90 min', 95, 'Combos');

-- Insert Mock Data (Professionals)
insert into public.professionals (name, role, image, performance, revenue, commission_service, commission_product, status) values
('João', 'Barbeiro Master', 'https://picsum.photos/seed/p1/200', 85, '1.8k', 40, 10, 'active'),
('Marcos', 'Especialista em Fade', 'https://picsum.photos/seed/p2/200', 65, '1.2k', 35, 10, 'active'),
('Ana', 'Visagista', 'https://picsum.photos/seed/p3/200', 50, '950', 45, 15, 'active');

-- Insert Mock Data (Products)
insert into public.products (name, brand, price, cost, image, stock, category, status) values
('Pomada Matte', 'Alta Fixação', 45, 22, 'https://picsum.photos/seed/pr1/200', 15, 'Finalizadores', 'normal'),
('Óleo de Barba', 'Essência Wood', 30, 14, 'https://picsum.photos/seed/pr2/200', 8, 'Barba', 'normal'),
('Shampoo Fresh', 'Vintage Club', 28, 12, 'https://picsum.photos/seed/pr3/200', 3, 'Higiene', 'low');
