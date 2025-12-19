-- TRIGGER FOR AUTOMATIC PROFILE CREATION
-- This ensures the profile is created immediately when a user signs up, avoiding RLS issues.

-- 1. Create the function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    coalesce(new.raw_user_meta_data ->> 'role', 'customer'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

-- 2. Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
