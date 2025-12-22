-- 1. Tabela de Profissionais
create table if not exists professionals (
  id uuid default gen_random_uuid() primary key,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer',
  commission integer default 0,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Serviços
create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  duration integer not null, -- em minutos
  price numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Agendamentos
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  client_name text not null,
  service_id uuid references services(id),
  service_name text, -- desnormalizado para facilitar
  professional_id uuid references professionals(id),
  date date not null,
  time time not null,
  price numeric(10,2),
  status text default 'pending', -- pending, confirmed, cancelled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabela de Despesas
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  amount numeric(10,2) not null,
  type text default 'fixed', -- fixed, variable
  date date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabela de Produtos (Estoque)
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric(10,2) not null,
  cost numeric(10,2),
  stock integer default 0,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS em todas
alter table professionals enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;
alter table expenses enable row level security;
alter table products enable row level security;

-- Políticas de Acesso (Simplificadas para o MVP: Autenticado faz tudo, Público lê o básico)

-- Profissionais
create policy "Public read professionals" on professionals for select using (true);
create policy "Auth insert professionals" on professionals for insert with check (auth.role() = 'authenticated');
create policy "Auth update professionals" on professionals for update using (auth.role() = 'authenticated');

-- Serviços
create policy "Public read services" on services for select using (true);
create policy "Auth insert services" on services for insert with check (auth.role() = 'authenticated');
create policy "Auth delete services" on services for delete using (auth.role() = 'authenticated');

-- Agendamentos
create policy "Auth all appointments" on appointments for all using (auth.role() = 'authenticated');

-- Despesas
create policy "Auth all expenses" on expenses for all using (auth.role() = 'authenticated');

-- Produtos
create policy "Public read products" on products for select using (true);
create policy "Auth all products" on products for all using (auth.role() = 'authenticated');

-- SEED DATA (Dados Iniciais)
insert into services (name, duration, price, description) values 
('Corte de Cabelo', 45, 50.00, 'Corte masculino completo.'),
('Barba', 30, 35.00, 'Barba desenhada.'),
('Corte + Barba', 60, 80.00, 'Combo completo.');

insert into professionals (name, role, commission, image) values 
('João Silva', 'Barbeiro Master', 50, 'https://i.pravatar.cc/150?u=joao'),
('Carlos Souza', 'Barbeiro', 40, 'https://i.pravatar.cc/150?u=carlos'),
('Ana Pereira', 'Manicure', 60, 'https://i.pravatar.cc/150?u=ana');
