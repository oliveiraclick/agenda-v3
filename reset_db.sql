-- DANGER: This script deletes ALL data from the application tables!
-- Use with caution.

-- Disable triggers to avoid constraints issues during deletion if needed, 
-- but CASCADE should handle most foreign keys.

TRUNCATE TABLE public.appointments CASCADE;
TRUNCATE TABLE public.campaigns CASCADE;
TRUNCATE TABLE public.expenses CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.services CASCADE;
TRUNCATE TABLE public.professionals CASCADE;
TRUNCATE TABLE public.establishments CASCADE;

-- Also clear profiles if you want a complete user reset (requires users to re-signup)
TRUNCATE TABLE public.profiles CASCADE;

-- If you are using Supabase Auth, simply deleting from profiles might desync with auth.users
-- But for "application data" reset, this is usually what is meant.
-- Note: You can't delete from auth.users via SQL editor usually.

-- Reset sequences if any (UUIDs don't need this)
