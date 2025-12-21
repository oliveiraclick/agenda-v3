-- Adiciona colunas para controle administrativo na tabela establishments

-- 1. Coluna STATUS (active, blocked, pending)
ALTER TABLE public.establishments 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' 
CHECK (status IN ('active', 'blocked', 'pending'));

-- 2. Coluna TRIAL_ENDS_AT (Data de fim do teste grátis)
ALTER TABLE public.establishments 
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- 3. Coluna SUBSCRIPTION_PLAN (free, pro, enterprise)
ALTER TABLE public.establishments 
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free' 
CHECK (subscription_plan IN ('free', 'pro', 'enterprise'));

-- 4. Cria índice para buscar por status (performance)
CREATE INDEX IF NOT EXISTS idx_establishments_status ON public.establishments(status);

-- 5. Atualiza registros existentes para terem valores padrão (segurança)
UPDATE public.establishments SET status = 'active' WHERE status IS NULL;
UPDATE public.establishments SET subscription_plan = 'free' WHERE subscription_plan IS NULL;
