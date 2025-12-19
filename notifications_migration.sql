-- NOTIFICATIONS MIGRATION

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  message text not null,
  read boolean default false,
  type text default 'info', -- 'info', 'success', 'warning'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true); -- Ideally restricted to server-side or specific triggers, but open for now for client-side demo
