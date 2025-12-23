-- Update check_phone_exists to be more robust against formatting
CREATE OR REPLACE FUNCTION check_phone_exists(phone_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_flag BOOLEAN;
  cleaned_input TEXT;
BEGIN
  -- Strip everything that is not a digit from the input
  cleaned_input := regexp_replace(phone_number, '\D', '', 'g');

  -- Check against both raw columns but also cleaned versions
  -- This covers cases where data was stored formatted vs clean
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE regexp_replace(phone, '\D', '', 'g') = cleaned_input 
       OR regexp_replace(telefone, '\D', '', 'g') = cleaned_input
  ) INTO exists_flag;
  
  RETURN exists_flag;
END;
$$;
