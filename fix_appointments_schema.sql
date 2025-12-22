-- Corrigindo Tabela de Agendamentos (Appointments) e RLS
-- O erro ocorre porque os agendamentos também precisam estar vinculados ao ESTABELECIMENTO
-- para que o dono possa vê-los (e não apenas o cliente que criou).

-- 1. Cria a coluna establishment_id se não existir
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES public.establishments(id);

-- 2. Habilita RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Limpa políticas antigas
DROP POLICY IF EXISTS "Auth all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can manage their establishment appointments" ON public.appointments;
DROP POLICY IF EXISTS "Customers can see their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Owners can see their establishment appointments" ON public.appointments;

-- 4. Cria novas políticas de acesso

-- REGRA 1: Cliente vê seus próprios agendamentos (user_id = auth.uid())
CREATE POLICY "Customers can see and create their own appointments"
ON public.appointments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- REGRA 2: Dono vê agendamentos do seu estabelecimento
CREATE POLICY "Owners can see and manage their establishment appointments"
ON public.appointments
FOR ALL
USING (
  establishment_id IN (
    SELECT id FROM public.establishments WHERE owner_id = auth.uid()
  )
);

-- Como as permissões se somam (OR), se for dono OU cliente do agendamento, vai funcionar.
