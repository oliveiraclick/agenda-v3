-- 1. Remove a restrição antiga que impedia o papel 'admin'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Adiciona a nova restrição permitindo 'admin'
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('owner', 'customer', 'professional', 'admin'));

-- 3. Atualiza os usuários para admin
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email IN ('denys@agendemais.app', 'jr@agendemais.app')
);

-- 4. Verifica o resultado
SELECT users.email, profiles.role 
FROM public.profiles 
JOIN auth.users ON profiles.id = users.id
WHERE users.email IN ('denys@agendemais.app', 'jr@agendemais.app');
