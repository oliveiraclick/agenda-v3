-- 1. Create Notifications Table if it doesn't exist
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  message text not null,
  read boolean default false,
  type text default 'info', -- 'info', 'success', 'warning'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLS with drops to avoid 'already exists'
alter table public.notifications enable row level security;
drop policy if exists "Users can view their own notifications" on public.notifications;
drop policy if exists "Users can update their own notifications" on public.notifications;
drop policy if exists "System can insert notifications" on public.notifications;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

-- 3. Triggers for Automatic Notifications
-- Function to notify on NEW appointment
create or replace function public.notify_new_appointment()
returns trigger as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (
    new.user_id,
    'Agendamento Recebido',
    'Seu agendamento para ' || to_char(new.date, 'DD/MM') || ' às ' || new.time || ' foi recebido.',
    'info'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for INSERT on appointments
drop trigger if exists on_appointment_created on public.appointments;
create trigger on_appointment_created
  after insert on public.appointments
  for each row execute procedure public.notify_new_appointment();

-- Notify cache reload
NOTIFY pgrst, 'reload config';
