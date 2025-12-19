-- MIGRATION SEGURA E COMPLETA (IDEMPOTENTE)
-- Este script verifica se as tabelas e políticas já existem antes de criar.

-- 1. FINANCEIRO (EXPENSES)
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  amount numeric not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null, -- 'fixed' (luz, agua) or 'variable' (comissao, extra)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.expenses enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'expenses' and policyname = 'Authenticated users can select expenses') then
    create policy "Authenticated users can select expenses" on public.expenses for select using (auth.role() = 'authenticated');
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'expenses' and policyname = 'Authenticated users can insert expenses') then
    create policy "Authenticated users can insert expenses" on public.expenses for insert with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'expenses' and policyname = 'Authenticated users can delete expenses') then
    create policy "Authenticated users can delete expenses" on public.expenses for delete using (auth.role() = 'authenticated');
  end if;
end $$;


-- 2. MARKETING (CAMPAIGNS)
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

alter table public.campaigns enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'campaigns' and policyname = 'Authenticated users can select campaigns') then
    create policy "Authenticated users can select campaigns" on public.campaigns for select using (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'campaigns' and policyname = 'Authenticated users can insert campaigns') then
    create policy "Authenticated users can insert campaigns" on public.campaigns for insert with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'campaigns' and policyname = 'Authenticated users can update campaigns') then
    create policy "Authenticated users can update campaigns" on public.campaigns for update using (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'campaigns' and policyname = 'Authenticated users can delete campaigns') then
    create policy "Authenticated users can delete campaigns" on public.campaigns for delete using (auth.role() = 'authenticated');
  end if;
end $$;


-- 3. NOTIFICAÇÕES (NOTIFICATIONS)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  message text not null,
  read boolean default false,
  type text default 'info', -- 'info', 'success', 'warning'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'notifications' and policyname = 'Users can view their own notifications') then
    create policy "Users can view their own notifications" on public.notifications for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'notifications' and policyname = 'Users can update their own notifications') then
    create policy "Users can update their own notifications" on public.notifications for update using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'notifications' and policyname = 'System can insert notifications') then
    create policy "System can insert notifications" on public.notifications for insert with check (true);
  end if;
end $$;


-- 4. GATILHOS REAIS (TRIGGERS)
-- Funções e Triggers podem ser recriados sem problemas com 'create or replace' e 'drop trigger if exists'

-- Função para notificar novo agendamento
create or replace function public.notify_new_appointment()
returns trigger as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (
    new.user_id,
    'Agendamento Recebido',
    'Seu agendamento para ' || to_char(new.date, 'DD/MM') || ' às ' || new.time || ' foi recebido e está pendente.',
    'info'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para INSERT em appointments
drop trigger if exists on_appointment_created on public.appointments;
create trigger on_appointment_created
  after insert on public.appointments
  for each row execute procedure public.notify_new_appointment();


-- Função para notificar mudança de status
create or replace function public.notify_appointment_status()
returns trigger as $$
begin
  if old.status <> new.status then
    insert into public.notifications (user_id, title, message, type)
    values (
      new.user_id,
      'Status Atualizado',
      'Seu agendamento mudou para: ' || 
        case 
          when new.status = 'confirmed' then 'Confirmado ✅'
          when new.status = 'cancelled' then 'Cancelado ❌'
          else new.status
        end,
      case 
        when new.status = 'confirmed' then 'success'
        when new.status = 'cancelled' then 'warning'
        else 'info'
      end
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para UPDATE em appointments
drop trigger if exists on_appointment_updated on public.appointments;
create trigger on_appointment_updated
  after update on public.appointments
  for each row execute procedure public.notify_appointment_status();
