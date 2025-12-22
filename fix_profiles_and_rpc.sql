
-- 1. Ensure columns exist and sync them
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- Sync data: If phone is null but telefone has data, copy it. And vice-versa.
UPDATE public.profiles SET phone = telefone WHERE phone IS NULL AND telefone IS NOT NULL;
UPDATE public.profiles SET telefone = phone WHERE telefone IS NULL AND phone IS NOT NULL;

-- Sync birth_date
UPDATE public.profiles SET birth_date = data_nascimento WHERE birth_date IS NULL AND data_nascimento IS NOT NULL;
UPDATE public.profiles SET data_nascimento = birth_date WHERE data_nascimento IS NULL AND birth_date IS NOT NULL;

-- 2. Create RPC to check phone uniqueness securely
-- This function runs with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION check_phone_exists(phone_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_flag BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE phone = phone_number OR telefone = phone_number
  ) INTO exists_flag;
  
  RETURN exists_flag;
END;
$$;
