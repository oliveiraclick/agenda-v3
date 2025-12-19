-- FINANCIAL & MARKETING MIGRATION

-- Create EXPENSES table
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  amount numeric not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null, -- 'fixed' (luz, agua) or 'variable' (comissao, extra)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Expenses
alter table public.expenses enable row level security;

create policy "Authenticated users can select expenses"
  on public.expenses for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert expenses"
  on public.expenses for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete expenses"
  on public.expenses for delete
  using (auth.role() = 'authenticated');


-- Create CAMPAIGNS table
create table if not exists public.campaigns (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  discount_percent integer not null,
  status text default 'active', -- 'active', 'scheduled', 'expired'
  end_date timestamp with time zone,
  usage_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Campaigns
alter table public.campaigns enable row level security;

create policy "Authenticated users can select campaigns"
  on public.campaigns for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert campaigns"
  on public.campaigns for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update campaigns"
  on public.campaigns for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete campaigns"
  on public.campaigns for delete
  using (auth.role() = 'authenticated');
