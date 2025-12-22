-- SCRIPT SEGURO PARA PREPARAÇÃO E2E
-- Este script limpa os dados e garante que o schema (tabelas novas) exista, sem dar erro de "policy exists".

-- 1. LIMPEZA TOTAL DE DADOS (TRUNCATE)
-- Limpa todas as tabelas principais. O CASCADE garante que tabelas dependentes (como agendamentos) também sejam limpas.
TRUNCATE TABLE public.appointments CASCADE;
-- TRUNCATE TABLE public.campaigns CASCADE; -- Se a tabela não existir ainda, essa linha daria erro, mas na primeira vez ok. 
-- Para garantir, vamos criar a tabela primeiro ou usar "IF EXISTS" (PG 12+), mas truncate safe é melhor por ordem.
DO $$ BEGIN
    PERFORM 1 FROM information_schema.tables WHERE table_name = 'campaigns';
    IF FOUND THEN
        TRUNCATE TABLE public.campaigns CASCADE;
    END IF;
END $$;

TRUNCATE TABLE public.expenses CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.services CASCADE;
TRUNCATE TABLE public.professionals CASCADE;
TRUNCATE TABLE public.establishments CASCADE;
-- TRUNCATE public.profiles CASCADE; -- Opcional: Descomente se quiser apagar os perfis de usuários também.

-- 2. CRIAÇÃO DA TABELA CAMPANHAS (SE NÃO EXISTIR)
create table if not exists campaigns (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  content text, 
  discount_percent integer,
  start_date date default CURRENT_DATE,
  end_date date,
  status text default 'draft', -- draft, active, ended
  usage_count integer default 0,
  establishment_id uuid references establishments(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (seguro rodar múltiplas vezes)
alter table campaigns enable row level security;

-- 3. CRIAÇÃO SEGURA DA POLICY (EVITA ERRO "ALREADY EXISTS")
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'campaigns' AND policyname = 'Auth all campaigns'
    ) THEN
        CREATE POLICY "Auth all campaigns" ON campaigns FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- 4. GARANTIA DAS COLUNAS DE PERFIL
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- 5. RPC DE CHECAGEM DE TELEFONE (ATUALIZAR SE NECESSÁRIO)
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
