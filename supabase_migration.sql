-- Create Establishments table (if not exists)
create table if not exists public.establishments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  type text, -- 'Cabelo • Hidratação'
  category text, -- 'salao', 'pet'
  rating numeric default 5.0,
  image_url text
);

-- Turn on RLS
alter table public.establishments enable row level security;
-- Allow read access to everyone
create policy "Allow public read access" on public.establishments for select using (true);

-- Insert Mock Data
insert into public.establishments (name, type, category, rating, image_url) values
('Studio Beauty Elite', 'Cabelo • Hidratação', 'salao', 4.9, 'https://picsum.photos/seed/shop1/400/200'),
('Don Barbearia', 'Corte • Barba', 'salao', 4.8, 'https://picsum.photos/seed/barber/400/200'),
('Pet Shop Amigo Fiel', 'Banho • Tosa', 'pet', 5.0, 'https://picsum.photos/seed/pet1/400/200'),
('Lava Rápido Jet', 'Lavagem • Polimento', 'li', 4.7, 'https://picsum.photos/seed/car/400/200'),
('Cantinho do Pet', 'Veterinário • Banho', 'pet', 4.9, 'https://picsum.photos/seed/pet2/400/200');

-- Create Favorites table
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  establishment_id uuid references public.establishments not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, establishment_id)
);

-- Turn on RLS
alter table public.favorites enable row level security;
-- Allow users to view/manage their own favorites
create policy "Users can view own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on public.favorites for delete using (auth.uid() = user_id);

-- Create Profiles table (Ensuring it exists for the Registration Flow)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  name text,
  role text default 'customer', -- 'customer', 'professional', 'owner', 'admin'
  avatar_url text,
  phone text
);

-- Turn on RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
