-- MASTER SCRIPT: CORREÇÃO GERAL DE SECURANÇA E COLUNAS
-- Este script garante que TODAS as tabelas tenham o vínculo com o estabelecimento
-- e as permissões corretas para o Dono não ter mais erros.

-- ==============================================================================
-- 1. GARANTIR A COLUNA ESTABLISHMENT_ID EM TODAS AS TABELAS
-- ==============================================================================

ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES public.establishments(id);

ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES public.establishments(id);

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES public.establishments(id);

ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES public.establishments(id);

-- Para garantir (caso não tenha rodado os anteriores)
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES public.establishments(id);

ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES public.establishments(id);


-- ==============================================================================
-- 2. RESETAR E APLICAR POLÍTICAS DE SEGURANÇA (RLS)
-- ==============================================================================

-- Função auxiliar para simplificar a lógica do Dono
-- (Opcional, mas ajuda a manter o código limpo, vamos fazer inline para garantir compatibilidade)

-- A. TABELA PROFESSIONALS (Equipe)
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read professionals" ON public.professionals;
DROP POLICY IF EXISTS "Owner manage professionals" ON public.professionals;

-- Qualquer um pode ver (para agendamento)
CREATE POLICY "Public read professionals" ON public.professionals FOR SELECT USING (true);

-- Só o dono do estabelecimento pode Criar/Editar/Apagar
CREATE POLICY "Owner manage professionals" ON public.professionals FOR ALL USING (
  establishment_id IN (SELECT id FROM public.establishments WHERE owner_id = auth.uid())
);


-- B. TABELA SERVICES (Serviços)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read services" ON public.services;
DROP POLICY IF EXISTS "Owner manage services" ON public.services;

CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);

CREATE POLICY "Owner manage services" ON public.services FOR ALL USING (
  establishment_id IN (SELECT id FROM public.establishments WHERE owner_id = auth.uid())
);


-- C. TABELA PRODUCTS (Estoque)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage products" ON public.products;

CREATE POLICY "Owner manage products" ON public.products FOR ALL USING (
  establishment_id IN (SELECT id FROM public.establishments WHERE owner_id = auth.uid())
);


-- D. TABELA CAMPAIGNS (Marketing)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage campaigns" ON public.campaigns;

CREATE POLICY "Owner manage campaigns" ON public.campaigns FOR ALL USING (
  establishment_id IN (SELECT id FROM public.establishments WHERE owner_id = auth.uid())
);

-- E. TABELA EXPENSES (Financeiro - Reforço)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert expenses for their establishment" ON public.expenses; -- Limpa anterior
DROP POLICY IF EXISTS "Owner manage expenses" ON public.expenses;

CREATE POLICY "Owner manage expenses" ON public.expenses FOR ALL USING (
  establishment_id IN (SELECT id FROM public.establishments WHERE owner_id = auth.uid())
);

-- F. TABELA APPOINTMENTS (Agendamentos - Reforço)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
-- Limpa anteriores
DROP POLICY IF EXISTS "Customers can see and create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Owners can see and manage their establishment appointments" ON public.appointments;
DROP POLICY IF EXISTS "Auth all appointments" ON public.appointments;

-- Regra Cliente (Vê o seu)
CREATE POLICY "Customers manage own appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id);

-- Regra Dono (Vê tudo do estabelecimento)
CREATE POLICY "Owners manage establishment appointments" ON public.appointments FOR ALL USING (
  establishment_id IN (SELECT id FROM public.establishments WHERE owner_id = auth.uid())
);

-- FIM DO SCRIPT MASTER
