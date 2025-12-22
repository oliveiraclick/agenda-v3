-- Corrigindo RLS para Tabela de Despesas (Expenses)
-- O erro ocorre porque o usuário não tem permissão para inserir/ver despesas após o reset.

-- 1. Habilita RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 2. Limpa políticas antigas
DROP POLICY IF EXISTS "Users can manage their establishment expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert expenses for their establishment" ON public.expenses;
DROP POLICY IF EXISTS "Users can select expenses for their establishment" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses for their establishment" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses for their establishment" ON public.expenses;

-- 3. Cria novas políticas baseadas na posse do ESTABELECIMENTO
-- O usuário pode mexer na despesa SE o establishment_id da despesa pertencer a um estabelecimento Dele.

CREATE POLICY "Users can insert expenses for their establishment"
ON public.expenses
FOR INSERT
WITH CHECK (
  establishment_id IN (
    SELECT id FROM public.establishments WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can select expenses for their establishment"
ON public.expenses
FOR SELECT
USING (
  establishment_id IN (
    SELECT id FROM public.establishments WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update expenses for their establishment"
ON public.expenses
FOR UPDATE
USING (
  establishment_id IN (
    SELECT id FROM public.establishments WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete expenses for their establishment"
ON public.expenses
FOR DELETE
USING (
  establishment_id IN (
    SELECT id FROM public.establishments WHERE owner_id = auth.uid()
  )
);
