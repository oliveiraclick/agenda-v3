-- Ensure owner_id column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'establishments' 
    AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.establishments ADD COLUMN owner_id uuid REFERENCES auth.users;
  END IF;
END $$;

-- Enable RLS just in case
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert establishments (linked to themselves)
-- Drop existing policy if it conflicts/exists (safe way)
DROP POLICY IF EXISTS "Owners can insert own establishment" ON public.establishments;
DROP POLICY IF EXISTS "Authenticated users can insert establishments" ON public.establishments;

-- Create the policy
-- We verify that the row being inserted has owner_id equal to the user's ID
CREATE POLICY "Owners can insert own establishment" 
ON public.establishments 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

-- Also allow owners to UPDATE their own establishment
DROP POLICY IF EXISTS "Owners can update own establishment" ON public.establishments;

CREATE POLICY "Owners can update own establishment" 
ON public.establishments 
FOR UPDATE
TO authenticated 
USING (auth.uid() = owner_id);
