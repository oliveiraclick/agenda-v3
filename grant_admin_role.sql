-- Substitua 'seu_email@exemplo.com' pelo email do usuário que será Super Admin
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'denys@agendemais.app'
);

-- Verifica se a atualização funcionou
SELECT * FROM public.profiles WHERE role = 'admin';
