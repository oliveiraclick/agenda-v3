-- 1. Função para criar usuário shadow (Cliente via Telefone)
DROP FUNCTION IF EXISTS create_shadow_user(text, text, text);

CREATE OR REPLACE FUNCTION create_shadow_user(
  p_email TEXT,
  p_password TEXT,
  p_phone TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Verifica se já existe
  SELECT id INTO new_id FROM auth.users WHERE email = p_email;
  
  IF new_id IS NOT NULL THEN
    RETURN new_id;
  END IF;

  -- Cria usuário na tabela auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now(),
    p_phone,
    now()
  ) RETURNING id INTO new_id;

  -- Cria identidade na tabela auth.identities (necessário para login funcionar corretamente)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_id,
    format('{"sub": "%s", "email": "%s"}', new_id::text, p_email)::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  RETURN new_id;
END;
$$;

-- 2. Garantir permissões na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove política antiga se existir para evitar conflito
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read any profile" ON public.profiles;

-- Cria políticas permissivas para o fluxo funcionar
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

CREATE POLICY "Users can read any profile"
  ON public.profiles FOR SELECT
  USING ( true );
