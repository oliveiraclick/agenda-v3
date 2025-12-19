-- Adiciona coluna birth_date na tabela profiles se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Adiciona coluna phone na tabela profiles se não existir (para redundância/busca fácil)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Garante permissões de update para o próprio usuário
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );
