-- Corrigindo Tabela de Despesas e RLS
-- O erro anterior mostrou que a coluna "establishment_id" NÃO EXISTE.
-- Vamos criar a coluna e vincular as regras.

-- 1. Cria a coluna se não existir
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES public.establishments(id);

-- 2. Habilita RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 3. Limpa políticas antigas
DROP POLICY IF EXISTS "Users can manage their establishment expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert expenses for their establishment" ON public.expenses;
DROP POLICY IF EXISTS "Users can select expenses for their establishment" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses for their establishment" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses for their establishment" ON public.expenses;

-- 4. Cria novas políticas
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
