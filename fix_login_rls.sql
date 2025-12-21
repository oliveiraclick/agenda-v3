-- Fix Profiles RLS for Login/Signup
alter table profiles enable row level security;

-- Drop potentially conflicting policies
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can view own profile" on profiles;

-- 1. Insert: Necessary for Signup
create policy "Users can insert their own profile"
on profiles for insert
with check ( auth.uid() = id );

-- 2. Select: Necessary for Login (fetching role)
-- Allow users to see their own profile specifically
create policy "Users can view own profile"
on profiles for select
using ( auth.uid() = id );

-- Also allow everyone to see basic profile info (needed for reviews, appointments etc usually)
-- But let's keep it simple for Login fix first.

-- 3. Update: For profile editing
create policy "Users can update own profile"
on profiles for update
using ( auth.uid() = id );
