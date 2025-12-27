
-- Fix Admin Deletion Permissions
-- Problem: Admins cannot delete salons because RLS likely restricts deletion to the Owner only.
-- Solution: Add a policy allowing users with role='admin' to DELETE establishments.

-- 1. Enable RLS (Ensure it's on)
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if necessary (optional, adding a new permissive one is usually enough)
-- We will just ADD a permissive policy for Admins.

CREATE POLICY "Admins can delete any establishment"
ON public.establishments
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- 3. Also allow Admins to UPDATE (for blocking/activating)
CREATE POLICY "Admins can update any establishment"
ON public.establishments
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- 4. Verify Policy for SELECT (Admins should see everything - usually already set, but reinforcing)
CREATE POLICY "Admins can view all establishments"
ON public.establishments
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);
